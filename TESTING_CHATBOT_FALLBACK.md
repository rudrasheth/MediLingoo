# 🧪 Testing Guide - Database → Gemini Fallback

## **Quick Test Cases**

### **Test 1: Disease IN Database (Asthma)**
```bash
curl -X POST http://localhost:5001/api/prescriptions/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userMessage": "I am having asthma"
  }'
```

**Expected Response:**
```json
{
  "reply": "Based on your query about **Asthma**, here is what I found...",
  "source": "database_search",
  "searchResults": [...],
  "severity": {
    "disease": "Asthma",
    "score": 6,
    "level": "Moderate",
    "isEmergency": false
  }
}
```

**Console Logs:**
```
✅ Found direct disease match in database
📊 Database Match - Disease: Asthma, Score: 6/10
```

---

### **Test 2: Disease NOT IN Database (Cancer) → Gemini Fallback** ⭐
```bash
curl -X POST http://localhost:5001/api/prescriptions/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userMessage": "I am facing cancer"
  }'
```

**Expected Response:**
```json
{
  "reply": "I understand you're facing a serious health concern. Cancer is a complex medical condition that requires immediate professional medical evaluation...",
  "source": "gemini_ai",
  "severity": {
    "disease": "cancer",
    "score": 9,
    "level": "Critical",
    "isEmergency": true
  }
}
```

**Console Logs:**
```
🔍 Checking database for: I am facing cancer
❌ Disease NOT found in database, using Gemini AI for intelligent response...
🔬 Detected disease from keywords: cancer, Severity: 9/10
✅ Gemini response sent. Source: gemini_ai, Disease: cancer
```

---

### **Test 3: Unknown Disease → Gemini Fallback**
```bash
curl -X POST http://localhost:5001/api/prescriptions/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userMessage": "I have a rare genetic disorder"
  }'
```

**Expected Response:**
```json
{
  "reply": "Rare genetic disorders require specialized medical evaluation. I recommend consulting with a genetic specialist...",
  "source": "gemini_ai"
}
```

---

### **Test 4: Multiple Diseases (First Match Wins)**
```bash
curl -X POST http://localhost:5001/api/prescriptions/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userMessage": "I have diabetes and heart problems"
  }'
```

**Expected Response:**
```json
{
  "reply": "...",
  "source": "database_search",
  "severity": {
    "disease": "diabetes",  // First match
    "score": 7,
    "isEmergency": true
  }
}
```

---

### **Test 5: Critical Emergency (Cancer)**
```bash
curl -X POST http://localhost:5001/api/prescriptions/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "userMessage": "I suspect I might have cancer"
  }'
```

**Expected Response:**
```json
{
  "reply": "[Gemini's intelligent response]",
  "source": "gemini_ai",
  "severity": {
    "disease": "cancer",
    "score": 9,
    "level": "Critical",
    "isEmergency": true  // ← AMBULANCE BUTTON SHOWS!
  }
}
```

**Frontend Behavior:**
```
- Red alert banner appears
- "🚑 Call Ambulance" button shows
- Emergency contact info displayed
```

---

## **Monitoring Console Logs**

### **Successful Database Hit**
```
✅ Found direct disease match in database
📊 Database Match - Disease: Asthma, Score: 6/10, Level: Moderate
```

### **Database Miss → Gemini Fallback**
```
🔍 Checking database for: I have cancer
📊 No direct match in database, trying vector search...
❌ Disease NOT found in database, using Gemini AI for intelligent response...
🔬 Detected disease from keywords: cancer, Severity: 9/10
✅ Gemini response sent. Source: gemini_ai, Disease: cancer
```

### **Error Handling**
```
⚠️ Vector search failed: Connection error
🔬 Detected disease from keywords: cancer, Severity: 9/10
⚠️ Model gemini-pro not found, trying next...
✅ Gemini response sent. Source: gemini_ai, Disease: cancer
```

---

## **Test Checklist**

- [ ] **Database Hit**: "asthma" → Returns database result
- [ ] **Database Miss**: "cancer" → Falls back to Gemini
- [ ] **Severity Calculation**: Cancer = 9/10 (Critical)
- [ ] **Emergency Alert**: Shows when severity ≥ 7
- [ ] **Ambulance Button**: Appears for critical diseases
- [ ] **User History Updated**: Medical history saved with severity
- [ ] **Vector Search Fallback**: Works if direct match fails
- [ ] **Multiple Diseases**: Takes first match
- [ ] **Unknown Conditions**: Gemini provides intelligent response
- [ ] **Error Recovery**: Falls back to next model if one fails

---

## **Database Severity Mapping**

For reference, these are automatically calculated:

```
cancer → 9/10 (CRITICAL) ← Ambulance button shows!
heart attack → 10/10 (CRITICAL)
stroke → 10/10 (CRITICAL)
diabetes → 7/10 (HIGH)
asthma → 6/10 (MODERATE)
cold → 2/10 (LOW)
fever → 3/10 (LOW)
```

---

## **API Endpoint Reference**

**POST** `/api/prescriptions/chat`

**Request:**
```json
{
  "userId": "user123",
  "userMessage": "I am facing cancer"
}
```

**Response (Database Hit):**
```json
{
  "reply": "string",
  "source": "database_search",
  "searchResults": [array],
  "severity": {
    "disease": "string",
    "score": number,
    "level": "Low|Moderate|High|Critical",
    "isEmergency": boolean
  }
}
```

**Response (Gemini Fallback):**
```json
{
  "reply": "string",
  "source": "gemini_ai",
  "severity": {
    "disease": "string",
    "score": number,
    "level": "Low|Moderate|High|Critical",
    "isEmergency": boolean
  }
}
```

---

## **Running Tests in Postman**

1. **Import Environment**
   - Add variable: `BASE_URL` = `http://localhost:5001`

2. **Create Request**
   - Method: `POST`
   - URL: `{{BASE_URL}}/api/prescriptions/chat`

3. **Add Body (JSON)**
   ```json
   {
     "userId": "test-user-123",
     "userMessage": "I have cancer"
   }
   ```

4. **Send & Observe**
   - Check `source` field (should be `gemini_ai` for cancer)
   - Check `severity.isEmergency` (should be `true`)
   - Check response text (should be from Gemini)

---

## **Expected Behavior Summary**

| Query | Source | Severity | Emergency | Notes |
|-------|--------|----------|-----------|-------|
| "asthma" | database_search | 6/10 | No | Found in DB |
| "cancer" | gemini_ai | 9/10 | Yes ← | Fallback to Gemini |
| "cold" | database_search | 2/10 | No | Found in DB |
| "rare disorder" | gemini_ai | ? | - | Fallback to Gemini |
| "heart attack" | database_search | 10/10 | Yes ← | Emergency! |

---

**Your app now intelligently handles ANY disease! 🎯**

When something is NOT in the database, Gemini AI takes over and provides intelligent, context-aware medical information.

