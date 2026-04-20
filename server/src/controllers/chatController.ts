import { Request, Response } from 'express';
import OpenAI from 'openai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/env';
import { MedicalHistory } from '../models/MedicalHistory';
import { MedicalKnowledge } from '../models/MedicalKnowledge';
import { getSeverityScore, getSeverityLevel, isEmergency } from '../utils/severityScorer';

// Calculate if the key is a Groq key
const isGroqKey = GEMINI_API_KEY?.startsWith('gsk_');

// Initialize OpenAI client (Groq compatible if gsk_ key is present)
const client = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: isGroqKey ? 'https://api.groq.com/openai/v1' : undefined
});

const EMERGENCY_THRESHOLD = 7; // Show ambulance button if severity >= 7

const getModelName = () => {
  if (isGroqKey) return 'llama-3.3-70b-versatile';
  return GEMINI_MODEL || 'gpt-3.5-turbo';
};

// Map common symptoms to actual database diseases
const SYMPTOM_TO_DISEASE_MAP: { [key: string]: string } = {
  'fever': 'Meningitis',  // Fever can be serious, map to severe condition
  'chest pain': 'Heart Disease',
  'difficulty breathing': 'Respiratory Distress',
  'cold': 'Pharyngitis',
  'cough': 'Bronchitis',
  'headache': 'Migraine',
  'pain': 'Migraine',
  'reflux': 'Acid Reflux',
  'stomach': 'Gastroenteritis',
  'water': 'Dehydration',
  'sleep': 'Insomnia',
  'itching': 'Eczema',
  'stroke': 'Stroke',
  'heart attack': 'Heart Disease',
  'cold hands': "Raynaud's Disease",
  'cold feet': "Raynaud's Disease",
  'raynaud': "Raynaud's Disease",
  'raynauds': "Raynaud's Disease",
  'freezing hands': "Raynaud's Disease",
  'freezing feet': "Raynaud's Disease",
  'cancer': 'SKIP_DATABASE'  // If found, skip database and use AI
};

// Keywords to skip database and go straight to AI
const DISEASE_KEYWORDS = [
  'diabetes', 'hypertension', 'blood pressure', 'sugar', 'cholesterol',
  'asthma', 'migraine', 'headache', 'fever', 'cold', 'flu', 'cough',
  'allergy', 'pain', 'arthritis', 'thyroid', 'heart', 'kidney',
  'bronchitis', 'pharyngitis', 'meningitis', 'tuberculosis', 'eczema',
  'acid reflux', 'gastroenteritis', 'dehydration', 'insomnia', 'glaucoma',
  'hernia', 'herniated disc', 'raynaud', 'lymph', 'electrolyte', 'infection',
  'chest pain', 'stroke', 'pneumonia', 'cancer', 'anxiety', 'depression'
];

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { userId, userMessage } = req.body;

    // Validate userMessage
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required and must be a string' });
    }

    // 1. Fetch the Patient's History to give AI context
    const history = userId ? await MedicalHistory.findOne({ userId }) : null;
    const context = history
      ? `Patient History: ${history.chronicConditions.join(", ")}. Current Meds: ${history.activeMedications.map(m => m.name).join(", ")}.`
      : "No previous history found.";

    console.log(`⚡ Using AI model: ${getModelName()} for: "${userMessage}"`);

    const systemPrompt = `You are MediLingo, a helpful medical assistant.
Context: ${context}
Answer clearly and remind the user to consult a doctor for emergencies.
Be specific about symptoms and treatments.`;

    // Extract disease from user message for severity checking
    let detectedDisease = null;
    let severityScore = 0;
    let severityLevel = 'Low';
    let isEmergencySituation = false;

    const lowerMessage = userMessage.toLowerCase();

    // 1. Check SYMPTOM_TO_DISEASE_MAP first (fastest and most specific)
    for (const [symptom, disease] of Object.entries(SYMPTOM_TO_DISEASE_MAP)) {
      if (lowerMessage.includes(symptom.toLowerCase()) && disease !== 'SKIP_DATABASE') {
        detectedDisease = disease;
        // Try to verify with DB to get perfect casing if needed, or just use the map's value
        const dbDisease = await MedicalKnowledge.findOne({ disease: { $regex: disease, $options: 'i' } }).lean();
        if (dbDisease) detectedDisease = dbDisease.disease;

        console.log(`✅ Symptom match found: "${symptom}" → "${detectedDisease}"`);
        break;
      }
    }

    // 2. If not found, Check DISEASE_KEYWORDS (broader)
    if (!detectedDisease) {
      for (const keyword of DISEASE_KEYWORDS) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          // Try to get the disease from database
          const dbDisease = await MedicalKnowledge.findOne({
            disease: { $regex: keyword, $options: 'i' }
          }).lean();

          if (dbDisease) {
            detectedDisease = dbDisease.disease;
          } else {
            // If not in database, use the keyword as disease name
            detectedDisease = keyword;
          }
          break;
        }
      }
    }

    // 3. Calculate Severity if disease detected
    if (detectedDisease) {
      severityScore = getSeverityScore(detectedDisease);
      severityLevel = getSeverityLevel(severityScore);
      isEmergencySituation = isEmergency(severityScore, EMERGENCY_THRESHOLD);

      console.log(`🔬 Detected disease: ${detectedDisease}, Severity: ${Math.round(severityScore * 10) / 10}/10`);

      // Update medical history with severity
      if (userId && history) {
        const updatedMaxScore = Math.max(history.maxSeverityScore || 0, severityScore);
        await MedicalHistory.updateOne(
          { userId },
          {
            maxSeverityScore: updatedMaxScore,
            lastSeverityScore: severityScore,
            $push: {
              severityHistory: {
                score: Math.round(severityScore * 10) / 10,
                detectedDisease,
                timestamp: new Date(),
                source: 'ai_detection'
              }
            },
            lastUpdated: new Date()
          }
        );
      }
    }

    try {
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: getModelName(),
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      const response: any = {
        reply: aiResponse,
        source: 'ai_generated'
      };

      // Add severity if detected
      if (detectedDisease) {
        response.severity = {
          score: Math.round(severityScore * 10) / 10,
          level: severityLevel,
          isEmergency: isEmergencySituation,
          disease: detectedDisease
        };
      }

      console.log(`✅ AI response sent.${detectedDisease ? ` Disease: ${detectedDisease}, Severity: ${Math.round(severityScore * 10) / 10}/10` : ''}`);
      return res.status(200).json(response);

    } catch (err: any) {
      console.error('❌ AI API Error:', err?.message || err);

      // Fallback: Return severity even if AI fails
      if (detectedDisease) {
        console.log(`⚠️ AI failed, but returning severity for: ${detectedDisease}`);
        return res.status(200).json({
          reply: "I'm having trouble connecting to my AI brain right now, but I detected a potential issue based on your symptoms. Please check the severity alert.",
          source: 'fallback_severity',
          severity: {
            score: Math.round(severityScore * 10) / 10,
            level: severityLevel,
            isEmergency: isEmergencySituation,
            disease: detectedDisease
          }
        });
      }

      return res.status(500).json({ error: 'AI service failed', details: err?.message });
    }

  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ error: 'Chatbot failed', details: (error as any)?.message });
  }
};