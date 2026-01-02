import { Request, Response } from 'express';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/env';
import { MedicalHistory } from '../models/MedicalHistory';
import { MedicalKnowledge } from '../models/MedicalKnowledge';
import { getSeverityScore, getSeverityLevel, isEmergency } from '../utils/severityScorer';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

const EMERGENCY_THRESHOLD = 7; // Show ambulance button if severity >= 7

const candidateModels = [
  GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.5-flash-latest',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b-latest',
  'gemini-1.5-pro-latest',
].filter(Boolean);

const isNotFound = (err: unknown) => {
  const msg = (err as any)?.message || String(err);
  return msg.toLowerCase().includes('not found');
};

// Keywords that trigger semantic search for remedies
const ADVISORY_KEYWORDS = [
  'suggest', 'advice', 'recommend', 'remedy', 'treatment', 'cure',
  'help', 'solution', 'what should', 'how to treat', 'manage',
  'prevent', 'relief', 'medication for', 'having', 'suffer', 'have',
  'experiencing', 'symptoms of', 'diagnosed', 'pain', 'ache', 'trouble'
];

// Disease keywords to detect medical queries
const DISEASE_KEYWORDS = [
  'diabetes', 'hypertension', 'blood pressure', 'sugar', 'cholesterol',
  'asthma', 'migraine', 'headache', 'fever', 'cold', 'flu', 'cough',
  'allergy', 'pain', 'arthritis', 'thyroid', 'heart', 'kidney',
  'bronchitis', 'pharyngitis', 'meningitis', 'tuberculosis', 'eczema',
  'acid reflux', 'gastroenteritis', 'dehydration', 'insomnia', 'glaucoma',
  'hernia', 'herniated disc', 'raynaud', 'lymph', 'electrolyte', 'infection',
  'chest pain', 'stroke', 'pneumonia', 'cancer', 'anxiety', 'depression'
];

const shouldUseSemanticSearch = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  const hasAdvisoryKeyword = ADVISORY_KEYWORDS.some(kw => lowerMessage.includes(kw));
  const hasDiseaseKeyword = DISEASE_KEYWORDS.some(kw => lowerMessage.includes(kw));
  // Return true if message has advisory keywords OR disease keywords
  // This catches queries like "suggest remedy for fever" or "I'm having chest pain"
  return hasAdvisoryKeyword || hasDiseaseKeyword;
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
  'cancer': 'SKIP_DATABASE'  // If found, skip database and use Gemini
};

// Extract disease name from message and try to find direct match
const findDiseaseFromQuery = async (userMessage: string) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // First try symptom-to-disease mapping (exact word match with word boundaries)
  for (const [symptom, disease] of Object.entries(SYMPTOM_TO_DISEASE_MAP)) {
    const symptomRegex = new RegExp(`\\b${symptom}\\b`, 'i');
    if (symptomRegex.test(lowerMessage)) {
      // Check if this is marked to skip database
      if (disease === 'SKIP_DATABASE') {
        console.log(`⏭️  Skipping database for: "${symptom}" (will use Gemini)`);
        return null; // Force fallback to Gemini
      }
      console.log(`✅ Symptom match found: "${symptom}" → "${disease}"`);
      const result = await MedicalKnowledge.findOne({ disease }).lean();
      if (result) return [result];
    }
  }
  
  // Then try direct disease name match (exact word match)
  const allDiseases = await MedicalKnowledge.distinct('disease');
  for (const disease of allDiseases) {
    // Use word boundary regex to match exact words only
    const diseaseRegex = new RegExp(`\\b${disease.toLowerCase()}\\b`, 'i');
    if (diseaseRegex.test(lowerMessage)) {
      console.log(`✅ Exact disease match found in database: "${disease}"`);
      const results = await MedicalKnowledge.find({ disease }).limit(3).lean();
      if (results.length > 0) return results;
    }
  }
  
  console.log(`❌ No exact disease match found in database for: "${userMessage}"`);
  return null;
};

const performSemanticSearch = async (userMessage: string) => {
  try {
    // Generate embedding for user query (384-D)
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embeddingResult = await embeddingModel.embedContent({
      content: { role: 'user', parts: [{ text: userMessage }] },
      taskType: TaskType.RETRIEVAL_QUERY,
      outputDimensionality: 384,
    });
    const queryVector = embeddingResult.embedding.values;

    // Perform vector search using MongoDB Atlas Vector Search
    const results = await MedicalKnowledge.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index', // Atlas vector search index name
          path: 'healthSummaryVector',
          queryVector: queryVector,
          numCandidates: 100,
          limit: 3
        }
      },
      {
        $project: {
          disease: 1,
          remedy: 1,
          precautions: 1,
          symptoms: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);

    return results.length > 0 ? results : null;
  } catch (vectorError) {
    console.log('⚠️ Vector search failed:', (vectorError as any)?.message);
    // Fallback: Use keyword matching on text_to_embed field
    const keywordResults = await MedicalKnowledge.find({
      $or: [
        { text_to_embed: { $regex: userMessage, $options: 'i' } },
        { disease: { $regex: userMessage, $options: 'i' } },
        { remedy: { $regex: userMessage, $options: 'i' } },
        { symptoms: { $elemMatch: { $regex: userMessage, $options: 'i' } } }
      ]
    }).limit(3).lean();
    
    return keywordResults.length > 0 ? keywordResults : null;
  }
};

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { userId, userMessage } = req.body;

    // Validate userMessage
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required and must be a string' });
    }

    // 1. Fetch the Patient's History to give Gemini context
    const history = userId ? await MedicalHistory.findOne({ userId }) : null;
    const context = history 
      ? `Patient History: ${history.chronicConditions.join(", ")}. Current Meds: ${history.activeMedications.map(m => m.name).join(", ")}.`
      : "No previous history found.";

    // 2. SKIP DATABASE - Go directly to Gemini API
    console.log('⚡ Skipping database search, using Gemini API directly for:', userMessage);

    // 3. Default: Ask Gemini with Context (fall back across known working models when 404 occurs)
    const chatPrompt = `
      You are MediLingo, a helpful medical assistant.
      Context: ${context}
      User Question: ${userMessage}
      Answer clearly and remind the user to consult a doctor for emergencies.
      Be specific about symptoms and treatments.
    `;

    // Extract disease from user message for severity checking
    let detectedDisease = null;
    let severityScore = 0;
    let severityLevel = 'Low';
    let isEmergencySituation = false;

    const lowerMessage = userMessage.toLowerCase();
    
    // Check DISEASE_KEYWORDS first (more comprehensive)
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
        
        severityScore = getSeverityScore(detectedDisease);
        severityLevel = getSeverityLevel(severityScore);
        isEmergencySituation = isEmergency(severityScore, EMERGENCY_THRESHOLD);
        
        console.log(`🔬 Detected disease from keywords: ${detectedDisease}, Severity: ${Math.round(severityScore * 10) / 10}/10`);
        
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
                  source: 'gemini_detection'
                }
              },
              lastUpdated: new Date()
            }
          );
        }
        break;
      }
    }

    let lastError: unknown;
    for (const modelId of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId });
        const result = await model.generateContent(chatPrompt);
        const geminiResponse = result.response.text();
        
        const response: any = {
          reply: geminiResponse,
          source: 'gemini_ai'  // Always from Gemini now
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
        
        console.log(`✅ Gemini API response sent.${detectedDisease ? ` Disease: ${detectedDisease}, Severity: ${Math.round(severityScore * 10) / 10}/10` : ''}`);
        return res.status(200).json(response);
      } catch (err) {
        lastError = err;
        if (isNotFound(err)) {
          console.log(`⚠️ Model ${modelId} not found, trying next...`);
          continue;
        }
        console.error(`❌ Error with model ${modelId}:`, (err as any)?.message);
        break;
      }
    }

    console.error('Chatbot Error:', lastError);
    res.status(500).json({ error: 'Chatbot failed', details: (lastError as any)?.message });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ error: 'Chatbot failed', details: (error as any)?.message });
  }
};