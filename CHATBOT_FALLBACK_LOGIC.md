# 🤖 MediLingo Chatbot - Database → Gemini Fallback System

## **How It Works Now**

### **Flow Diagram**

```
User: "I have cancer"
         ↓
    [Check Database]
         ↓
    ❌ NOT FOUND
         ↓
    [Use Gemini API]
         ↓
    Intelligent Response
         ↓
    "Cancer is a serious condition..."
```

---

## **Step-by-Step Logic**

### **Step 1: Message Analysis**
```typescript
Input: "I have cancer"

Checks if message contains:
- ADVISORY_KEYWORDS: suggest, advice, remedy, treatment, having, suffering
- DISEASE_KEYWORDS: diabetes, asthma, cancer, heart disease, etc.

Result: ✅ Has "cancer" → Needs semantic search
```

### **Step 2: Database Lookup**
```typescript
First attempt: Direct disease matching
- Looks in MedicalKnowledge collection
- Query: { disease: { $regex: 'cancer', $options: 'i' } }

Result: ❌ Cancer data not found in database
```

### **Step 3: Vector Search (Fallback)**
```typescript
If direct match fails, try semantic search:
- Converts query to 384-dimensional embedding
- Searches similar medical documents
- Looks for related conditions

Result: ❌ Still not found or low confidence
```

### **Step 4: Gemini AI Fallback** ✨
```typescript
Since database has NO result for "cancer":
- Send to Gemini API
- Gemini provides intelligent medical response
- Response includes severity detection

Result: ✅ Gemini responds with cancer information
```

### **Step 5: Severity Scoring**
```typescript
While Gemini responds, also:
- Detect disease in message: "cancer"
- Calculate severity: Cancer = 9/10 (CRITICAL)
- Update user medical history
- Show emergency alert if score ≥ 7

Result: Emergency ambulance button shown
```

---

## **Code Implementation**

### **Database Search (Lines 167-229)**
```typescript
if (shouldUseSemanticSearch(userMessage)) {
  console.log('🔍 Checking database for:', userMessage);
  
  // TRY: Direct disease matching
  searchResults = await findDiseaseFromQuery(userMessage);
  
  // TRY: Vector search if no direct match
  if (!searchResults) {
    searchResults = await performSemanticSearch(userMessage);
  }
  
  // IF FOUND: Return database result
  if (searchResults && searchResults.length > 0) {
    foundInDatabase = true;
    return res.status(200).json({
      reply: databaseResult,
      source: 'database_search',
      severity: { ... }
    });
  }
  
  // IF NOT FOUND: Fall through to Gemini
  console.log('❌ Disease NOT found in database, using Gemini AI...');
}
```

### **Gemini Fallback (Lines 231-310)**
```typescript
// Gemini gets the message since database had no result
const chatPrompt = `
  You are MediLingo, a helpful medical assistant.
  Context: ${context}
  User Question: ${userMessage}  // "I have cancer"
  Answer clearly and remind the user to consult a doctor.
`;

// Extract disease for severity
for (const keyword of DISEASE_KEYWORDS) {
  if (lowerMessage.includes(keyword)) {
    detectedDisease = keyword;  // "cancer"
    severityScore = getSeverityScore(detectedDisease);  // 9/10
    break;
  }
}

// Call Gemini AI
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const result = await model.generateContent(chatPrompt);

return res.status(200).json({
  reply: result.response.text(),  // Gemini's intelligent response
  source: 'gemini_ai',
  severity: {
    disease: 'cancer',
    score: 9,
    level: 'Critical',
    isEmergency: true  // ← Shows ambulance button!
  }
});
```

---

## **Example Scenarios**

### **Scenario 1: Disease IN Database (Asthma)**
```
User: "I have asthma symptoms"
       ↓
Database: FOUND ✅
       ↓
Return from database
Source: "database_search"
Severity: Asthma = 6/10 (Moderate)
```

### **Scenario 2: Disease NOT IN Database (Cancer)**
```
User: "I have cancer"
       ↓
Database: NOT FOUND ❌
       ↓
Gemini API: "Cancer is a serious condition that requires..."
Source: "gemini_ai"
Severity: Cancer = 9/10 (CRITICAL)
Emergency: true ← Shows ambulance button
```

### **Scenario 3: Unknown Condition**
```
User: "I have a rare condition"
       ↓
Database: NOT FOUND ❌
       ↓
Gemini API: "A rare condition requires proper medical evaluation..."
Source: "gemini_ai"
Severity: 5/10 (Moderate)
```

---

## **Supported Disease Keywords**

```typescript
const DISEASE_KEYWORDS = [
  'diabetes', 'hypertension', 'blood pressure', 'sugar',
  'asthma', 'migraine', 'headache', 'fever', 'cold', 'flu',
  'allergy', 'pain', 'arthritis', 'thyroid', 'heart',
  'bronchitis', 'meningitis', 'tuberculosis', 'eczema',
  'acid reflux', 'gastroenteritis', 'pneumonia',
  'cancer',  ← Now properly handled!
  'anxiety', 'depression'
];
```

---

## **Severity Scoring System**

```typescript
Disease → Severity Score (1-10)

Critical (9-10):
  - Heart Attack: 10/10
  - Stroke: 10/10
  - Cancer: 9/10
  - Meningitis: 9/10
  - Sepsis: 10/10

High (7-8):
  - Diabetes: 7/10
  - Hypertension: 7/10
  - Severe Asthma: 8/10
  - Pneumonia: 8/10

Moderate (4-6):
  - Migraine: 5/10
  - Arthritis: 5/10
  - Allergies: 4/10
  - Gastroenteritis: 5/10

Low (1-3):
  - Cold: 2/10
  - Fever: 3/10
  - Sore Throat: 2/10

Rule: If severity ≥ 7 → Show EMERGENCY alert with ambulance button
```

---

## **Database Update on Disease Detection**

When any disease is detected (from database or Gemini), the system updates:

```typescript
MedicalHistory.updateOne(
  { userId },
  {
    maxSeverityScore: 9,  // Highest severity seen
    lastSeverityScore: 9,  // Latest severity
    $push: {
      severityHistory: {
        score: 9,
        detectedDisease: 'cancer',
        timestamp: new Date(),
        source: 'gemini_detection'  // Shows it came from Gemini, not database
      }
    }
  }
);
```

---

## **API Response Format**

### **Database Hit**
```json
{
  "reply": "Based on your asthma query, here's what I found...",
  "source": "database_search",
  "searchResults": [
    {
      "disease": "Asthma",
      "remedy": "Use inhalers...",
      "precautions": ["...", "..."]
    }
  ],
  "severity": {
    "disease": "Asthma",
    "score": 6,
    "level": "Moderate",
    "isEmergency": false
  }
}
```

### **Gemini Fallback**
```json
{
  "reply": "Cancer is a serious medical condition that requires immediate professional medical evaluation...",
  "source": "gemini_ai",
  "severity": {
    "disease": "cancer",
    "score": 9,
    "level": "Critical",
    "isEmergency": true
  }
}
```

---

## **Frontend Integration**

### **Show Emergency Alert**
```typescript
// In Chatbot component
if (response.severity?.isEmergency) {
  showEmergencyAlert(response.severity.disease);
  showAmbulanceButton();
}
```

### **Display Severity Badge**
```typescript
<div className="severity-badge">
  <span className={getSeverityColor(response.severity.score)}>
    {response.severity.disease} - {response.severity.level}
  </span>
</div>
```

---

## **Testing the Fallback**

### **Test Case 1: Cancer Query**
```bash
curl -X POST http://localhost:5001/api/prescriptions/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "userMessage": "I have cancer"
  }'
```

Expected response:
```json
{
  "reply": "[Gemini's intelligent response about cancer]",
  "source": "gemini_ai",
  "severity": {
    "disease": "cancer",
    "score": 9,
    "isEmergency": true
  }
}
```

### **Test Case 2: Asthma Query (In Database)**
```bash
curl -X POST http://localhost:5001/api/prescriptions/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "userMessage": "I have asthma"
  }'
```

Expected response:
```json
{
  "reply": "[Database information about asthma]",
  "source": "database_search",
  "severity": {
    "disease": "Asthma",
    "score": 6,
    "isEmergency": false
  }
}
```

---

## **Logs to Watch**

```
// Database found
✅ Found direct disease match in database
📊 Database Match - Disease: Asthma, Score: 6/10

// Database not found → Gemini
❌ Disease NOT found in database, using Gemini AI for intelligent response...
🔬 Detected disease from keywords: cancer, Severity: 9/10
✅ Gemini response sent. Source: gemini_ai, Disease: cancer
```

---

## **Summary**

| Scenario | Database | Gemini | Severity | Emergency |
|----------|----------|--------|----------|-----------|
| Asthma | ✅ Found | - | 6/10 | No |
| Cancer | ❌ Not Found | ✅ Used | 9/10 | Yes ← Ambulance button |
| Cold | ✅ Found | - | 2/10 | No |
| Unknown | ❌ Not Found | ✅ Used | - | - |

**Result**: Your app now intelligently handles ANY disease question! 🎯

