# 🏗️ Chatbot Architecture - Database Fallback System

## **Complete Flow Architecture**

```
                    USER INPUT
                       ↓
              "I have cancer"
                       ↓
                       
        ┌──────────────────────────────┐
        │   Message Analysis Layer      │
        └──────────────────────────────┘
                       ↓
          Check for DISEASE_KEYWORDS
             (including 'cancer')
                       ↓
                    ✅ YES
                       ↓

        ┌──────────────────────────────┐
        │   Semantic Search Layer       │
        └──────────────────────────────┘
                       ↓
        ┌─────────────────────────────────────────┐
        │  Step 1: Direct Disease Name Matching   │
        │  Query: { disease: /cancer/i }          │
        └─────────────────────────────────────────┘
                       ↓
                    ❌ NOT FOUND
                       ↓
        ┌─────────────────────────────────────────┐
        │  Step 2: Vector Search (384-D embedding)│
        │  Search similarity in 100 candidates    │
        └─────────────────────────────────────────┘
                       ↓
                    ❌ NOT FOUND
                       ↓
        
        ┌──────────────────────────────┐
        │   Fallback to Gemini AI       │
        └──────────────────────────────┘
                       ↓
        ┌────────────────────────────────────────────┐
        │  Send to Gemini with Full Context         │
        │  - User message: "I have cancer"          │
        │  - Patient history                         │
        │  - Current medications                     │
        └────────────────────────────────────────────┘
                       ↓
        ┌────────────────────────────────────────────┐
        │  Gemini AI Response Generation             │
        │  "Cancer is a serious condition..."        │
        └────────────────────────────────────────────┘
                       ↓
                       
        ┌──────────────────────────────┐
        │   Severity Detection Layer    │
        └──────────────────────────────┘
                       ↓
        Extract disease from message: "cancer"
             Check DISEASE_KEYWORDS
                   ↓
        Cancer found → getSeverityScore("cancer")
                   ↓
             Severity = 9/10
             Level = "CRITICAL"
             Emergency = true
                       ↓
                       
        ┌──────────────────────────────┐
        │   Update Medical History      │
        └──────────────────────────────┘
                       ↓
        {
          disease: "cancer",
          score: 9,
          timestamp: now,
          source: "gemini_detection"  ← Shows it came from Gemini
        }
                       ↓
                       
        ┌──────────────────────────────┐
        │   Prepare JSON Response       │
        └──────────────────────────────┘
                       ↓
        {
          reply: "[Gemini's response]",
          source: "gemini_ai",           ← Not database!
          severity: {
            disease: "cancer",
            score: 9,
            level: "CRITICAL",
            isEmergency: true             ← TRIGGER ALERT!
          }
        }
                       ↓
                       
        ┌──────────────────────────────┐
        │   Send to Frontend            │
        └──────────────────────────────┘
                       ↓
                       
        ┌──────────────────────────────┐
        │   Frontend Renders            │
        │   - Display Gemini response   │
        │   - Show severity badge       │
        │   - Show EMERGENCY ALERT      │
        │   - Show AMBULANCE BUTTON 🚑  │
        └──────────────────────────────┘
```

---

## **Decision Tree**

```
START: User Message = "I have cancer"
│
├─ Has DISEASE_KEYWORDS? 
│  └─ YES → Try Database
│     │
│     ├─ Step 1: Direct Match?
│     │  └─ NO → Try Vector Search
│     │     │
│     │     ├─ Step 2: Vector Match?
│     │     │  └─ NO → FALLBACK TO GEMINI
│     │     │
│     │     └─ YES → Return Database Result
│     │
│     └─ YES → Return Database Result
│
└─ NO → Go directly to GEMINI

GEMINI PATH:
│
├─ Generate embedding for query
├─ Get Gemini AI response
├─ Detect disease in original message
├─ Calculate severity
├─ Update medical history
└─ Return response with severity
```

---

## **Code Flow Execution Order**

```
1. handleChat() invoked
   ↓
2. Fetch patient medical history from DB
   ↓
3. shouldUseSemanticSearch() → Check keywords
   ↓
4. IF YES: Try database lookup
   │
   ├─ findDiseaseFromQuery()
   │  ├─ Check symptom mapping
   │  └─ Check exact disease name
   │
   ├─ IF found: Return database result + severity
   │
   └─ IF NOT found: performSemanticSearch()
      ├─ Generate embedding
      ├─ Vector search (384-D)
      ├─ IF found: Return database result
      └─ IF NOT found: Fall through to Gemini
   
5. IF NO or DATABASE FAILED: Gemini AI path
   │
   ├─ Generate chat prompt with context
   ├─ Extract disease keywords
   ├─ Get severity score for disease
   ├─ Create model list (gemini-pro, gemini-2.5-flash, etc.)
   │
   ├─ FOR EACH model:
   │  ├─ Call genAI.getGenerativeModel()
   │  ├─ Generate content with chatPrompt
   │  ├─ IF success: Build response + severity → RETURN
   │  ├─ IF 404: Try next model
   │  └─ IF other error: Break loop
   │
   ├─ Update medical history with severity
   └─ Return JSON response
      {
        reply: "Gemini response",
        source: "gemini_ai",
        severity: { disease, score, level, isEmergency }
      }

6. Frontend receives response
   │
   └─ IF isEmergency = true
      └─ Show red alert + ambulance button 🚑
```

---

## **Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  User Types: "I have cancer"                               │
│  Component: AdvancedChatbot.tsx                            │
│  API Call: POST /api/prescriptions/chat                    │
│  { userId, userMessage }                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Express)                    │
├─────────────────────────────────────────────────────────────┤
│  Route: /api/prescriptions/chat                            │
│  Controller: chatController.ts → handleChat()              │
│  Authentication: Middleware validates JWT                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              SEMANTIC SEARCH LAYER (MongoDB)               │
├─────────────────────────────────────────────────────────────┤
│  Collection: MedicalKnowledge                              │
│  Query 1: { disease: { $regex: 'cancer', $options: 'i' } } │
│  Result: ❌ No document found                              │
│                                                             │
│  Query 2: $vectorSearch on healthSummaryVector            │
│  - Generate embedding: "I have cancer"                    │
│  - Search 100 candidates                                   │
│  Result: ❌ No match above threshold                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ (FALLBACK)
┌─────────────────────────────────────────────────────────────┐
│              GEMINI AI API (Google Cloud)                   │
├─────────────────────────────────────────────────────────────┤
│  Model: gemini-pro, gemini-2.5-flash, gemini-1.5-pro      │
│  Request: generateContent({                               │
│    "You are MediLingo...",                                │
│    "Context: Patient History...",                         │
│    "User Question: I have cancer"                         │
│  })                                                         │
│                                                             │
│  Response: "Cancer is a serious medical condition..."     │
│  Status: 200 OK                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           SEVERITY CALCULATION & DB UPDATE                  │
├─────────────────────────────────────────────────────────────┤
│  Extract disease from message: "cancer"                    │
│  Look up: DISEASE_KEYWORDS → Found "cancer"               │
│                                                             │
│  getSeverityScore("cancer") → 9                            │
│  getSeverityLevel(9) → "Critical"                          │
│  isEmergency(9, threshold=7) → true                        │
│                                                             │
│  Update MedicalHistory:                                    │
│  {                                                          │
│    maxSeverityScore: 9,                                    │
│    lastSeverityScore: 9,                                   │
│    $push: {                                                │
│      score: 9,                                             │
│      detectedDisease: "cancer",                            │
│      source: "gemini_detection"                            │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              RESPONSE GENERATION (JSON)                     │
├─────────────────────────────────────────────────────────────┤
│  {                                                          │
│    "reply": "Cancer is a serious condition...",           │
│    "source": "gemini_ai",  ← Shows it came from Gemini!   │
│    "severity": {                                           │
│      "disease": "cancer",                                  │
│      "score": 9,                                           │
│      "level": "Critical",                                  │
│      "isEmergency": true   ← Triggers ambulance button!   │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP 200
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Receive JSON response                                     │
│                                                             │
│  IF severity.isEmergency = true:                          │
│  ├─ Show RED alert banner                                │
│  ├─ Display: "CRITICAL: cancer"                          │
│  ├─ Show: "🚑 CALL AMBULANCE" button                     │
│  ├─ Enable emergency contact options                     │
│  └─ Play alert sound (optional)                          │
│                                                             │
│  Display message:                                         │
│  "Cancer is a serious condition..."                       │
│                                                             │
│  Update UI:                                               │
│  ├─ Add severity badge (RED)                              │
│  ├─ Scroll to message                                     │
│  └─ Update medicine history                              │
└─────────────────────────────────────────────────────────────┘
```

---

## **Comparison: Database vs Gemini**

### **Database Route** (If found)
```
Message → Database Check → Found ✅
  │
  ├─ Source: database_search
  ├─ Speed: <50ms
  ├─ Cost: Free (MongoDB)
  ├─ Response: Structured (remedy, precautions)
  └─ Severity: Calculated from disease name
```

### **Gemini Route** (If NOT found)
```
Message → Database Check → NOT Found ❌ → Gemini
  │
  ├─ Source: gemini_ai
  ├─ Speed: 1-3 seconds
  ├─ Cost: $0.075 per 1M input tokens
  ├─ Response: Natural language, context-aware
  └─ Severity: Calculated from keywords
```

---

## **Error Handling Flow**

```
START: generateContent() call
│
├─ Success? 
│  └─ YES → Return response
│
└─ NO → Check error type
   │
   ├─ 404 Not Found?
   │  └─ YES → Try next model in candidateModels
   │     │
   │     ├─ More models?
   │     │  └─ YES → Loop back
   │     │
   │     └─ NO models left?
   │        └─ Return 500 error
   │
   └─ Other error?
      └─ NO → Break loop → Return 500 error
```

---

## **Key Variables & Their Meanings**

```typescript
searchResults        // Array of MedicalKnowledge documents from DB
foundInDatabase      // Boolean: Was result found in database?
detectedDisease      // String: Disease detected (e.g., "cancer")
severityScore        // Number: Severity score 1-10
severityLevel        // String: "Low", "Moderate", "High", "Critical"
isEmergencySituation // Boolean: Is it >= 7 threshold?
history              // User's MedicalHistory document
context              // Patient history string for Gemini prompt
lowerMessage         // Lowercase version of userMessage
candidateModels      // Array of Gemini model IDs to try
```

---

## **Success Metrics**

```
✅ Database Hit Rate: % of queries found in database
   Target: >60% for common conditions

✅ Gemini Fallback: % of queries needing Gemini
   Target: <40% for uncommon conditions

✅ Emergency Detection: % of critical diseases correctly identified
   Target: >95% accuracy

✅ Response Time:
   Database: <50ms
   Gemini: 1-3 seconds
   Total with overhead: <3.5 seconds

✅ User Satisfaction:
   Database results: 95% relevant
   Gemini results: 85% relevant
```

---

**This architecture ensures your app NEVER gives up on a user query! 🎯**

If the database doesn't know, Gemini AI always has intelligent answers.

