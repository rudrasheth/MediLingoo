# MediLingo Authentication API - Testing Guide

## Base URL
```
http://localhost:5001
```

---

## 1. SIGNUP - Create New User Account

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user with email, password, and age.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "testuser@gmail.com",
  "password": "password123",
  "age": 28,
  "name": "Test User"
}
```

### Expected Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "testuser@gmail.com",
    "name": "Test User",
    "age": 28
  }
}
```

### Notes
- ✅ Session cookie will be set automatically (`medilingo_session`)
- ✅ Password is automatically hashed before saving
- ✅ Email must be unique
- ✅ Password minimum 6 characters
- ✅ Age must be between 1-150

### Test Cases
```json
// ✅ Valid signup
{
  "email": "john@example.com",
  "password": "secure123",
  "age": 30,
  "name": "John Doe"
}

// ❌ Missing email
{
  "password": "secure123",
  "age": 30
}

// ❌ Invalid email format
{
  "email": "notanemail",
  "password": "secure123",
  "age": 30
}

// ❌ Password too short
{
  "email": "jane@example.com",
  "password": "123",
  "age": 30
}

// ❌ Age out of range
{
  "email": "jane@example.com",
  "password": "secure123",
  "age": 200
}

// ❌ Duplicate email
{
  "email": "john@example.com",
  "password": "secure123",
  "age": 35
}
```

---

## 2. LOGIN - Authenticate User

**Endpoint:** `POST /api/auth/login`

**Description:** Login with email and password to create a session.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "testuser@gmail.com",
  "password": "password123"
}
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "testuser@gmail.com",
    "name": "Test User",
    "age": 28
  }
}
```

### Notes
- ✅ Session cookie will be set automatically
- ✅ Password is compared securely with bcrypt
- ✅ Credentials are case-sensitive for password (email is lowercased)
- ✅ Both email and password are required

### Test Cases
```json
// ✅ Valid login
{
  "email": "testuser@gmail.com",
  "password": "password123"
}

// ❌ Wrong password
{
  "email": "testuser@gmail.com",
  "password": "wrongpassword"
}

// ❌ Non-existent email
{
  "email": "nonexistent@gmail.com",
  "password": "password123"
}

// ❌ Missing email
{
  "password": "password123"
}

// ❌ Missing password
{
  "email": "testuser@gmail.com"
}
```

---

## 3. GET PROFILE - Retrieve User Profile (Protected)

**Endpoint:** `GET /api/auth/profile`

**Description:** Get the current authenticated user's profile information.

### Request Headers
```
Content-Type: application/json
```

**Note:** Session cookie from login/signup will be sent automatically by your HTTP client.

### Expected Response (200)
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "testuser@gmail.com",
    "age": 28,
    "languagePreference": "English",
    "tier": "Free",
    "createdAt": "2025-12-23T10:30:00.000Z"
  }
}
```

### Error Response - No Session (401)
```json
{
  "success": false,
  "message": "Authentication required. Please login first."
}
```

### Notes
- ✅ Requires valid session cookie
- ✅ Password and OTP fields are excluded for security
- ✅ Returns MongoDB `_id` (24-character hex)

---

## 4. FORGOT PASSWORD - Request OTP

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Send OTP to email for password reset.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "testuser@gmail.com"
}
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "OTP sent to your email. Valid for 10 minutes."
}
```

### Notes
- ✅ OTP is 6 digits (e.g., `123456`)
- ✅ OTP valid for 10 minutes
- ✅ Doesn't reveal if email exists (security)
- ✅ Check email for OTP code
- ✅ Email is case-insensitive

### Test Cases
```json
// ✅ Valid email (registered)
{
  "email": "testuser@gmail.com"
}

// ✅ Valid email (not registered - doesn't reveal)
{
  "email": "nonexistent@example.com"
}

// ❌ Missing email
{}
```

---

## 5. RESET PASSWORD - Verify OTP & Update Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Verify OTP and reset user password.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "testuser@gmail.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

### Error Response - Invalid OTP (401)
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

### Error Response - Expired OTP (401)
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
```

### Notes
- ✅ OTP must match exactly (6 digits)
- ✅ OTP must not be expired (10 minute window)
- ✅ New password minimum 6 characters
- ✅ OTP is cleared from database after successful reset
- ✅ You can login with new password after reset

### Test Cases
```json
// ✅ Valid reset (with OTP from email)
{
  "email": "testuser@gmail.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}

// ❌ Invalid OTP
{
  "email": "testuser@gmail.com",
  "otp": "999999",
  "newPassword": "newpassword123"
}

// ❌ Expired OTP (after 10 minutes)
{
  "email": "testuser@gmail.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}

// ❌ Password too short
{
  "email": "testuser@gmail.com",
  "otp": "123456",
  "newPassword": "123"
}

// ❌ Missing fields
{
  "email": "testuser@gmail.com"
}
```

---

## 6. LOGOUT - Destroy Session (Protected)

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout and destroy the user session.

### Request Headers
```
Content-Type: application/json
```

**Note:** Session cookie must be present.

### Expected Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Error Response - Not Authenticated (401)
```json
{
  "success": false,
  "message": "Authentication required. Please login first."
}
```

### Notes
- ✅ Requires valid session cookie
- ✅ Session cookie is cleared
- ✅ Subsequent requests without login will be rejected

---

## 📋 Complete Testing Workflow

### Step 1: Signup
```
POST /api/auth/signup
{
  "email": "testuser@gmail.com",
  "password": "password123",
  "age": 28,
  "name": "Test User"
}
```
✅ Session created automatically

---

### Step 2: Get Profile (Verify Session)
```
GET /api/auth/profile
```
✅ Should return user profile (session still valid)

---

### Step 3: Logout
```
POST /api/auth/logout
```
✅ Session destroyed

---

### Step 4: Try Profile Without Login
```
GET /api/auth/profile
```
❌ Should return 401 (not authenticated)

---

### Step 5: Login
```
POST /api/auth/login
{
  "email": "testuser@gmail.com",
  "password": "password123"
}
```
✅ New session created

---

### Step 6: Request Password Reset
```
POST /api/auth/forgot-password
{
  "email": "testuser@gmail.com"
}
```
✅ OTP sent to email (check your inbox)

---

### Step 7: Reset Password (Within 10 minutes)
```
POST /api/auth/reset-password
{
  "email": "testuser@gmail.com",
  "otp": "[OTP_FROM_EMAIL]",
  "newPassword": "newpassword123"
}
```
✅ Password updated

---

### Step 8: Login With New Password
```
POST /api/auth/login
{
  "email": "testuser@gmail.com",
  "password": "newpassword123"
}
```
✅ Successfully logged in with new password

---

## 🔍 Postman Tips

### How to Enable Cookies
1. **In Postman**, go to **Settings** (⚙️ icon)
2. Scroll to **Cookies**
3. Toggle **Automatically follow redirects** ON
4. Cookies will be saved automatically between requests

### Viewing Cookies
1. In **Postman**, go to **Cookies** tab at the bottom
2. Click on your server URL (e.g., `localhost:5001`)
3. You can see `medilingo_session` cookie

### Testing Protected Routes
1. Make a request to login/signup first
2. Session cookie is saved automatically
3. Make requests to protected routes (they'll use the saved cookie)
4. Logout to clear the session
5. Protected routes will now return 401

### Import as Collection
You can import this as a Postman collection for easier testing.

---

## 🛡️ Security Features Tested

- ✅ Password hashing (bcrypt)
- ✅ Session-based authentication
- ✅ HTTP-only secure cookies
- ✅ OTP with expiration
- ✅ Email validation
- ✅ Input sanitization
- ✅ Protected routes
- ✅ CSRF protection (sameSite=strict)

---

## 📱 Frontend Integration Example

After successful login/signup, your frontend will automatically include the session cookie in requests:

```javascript
// Frontend - No need to manually handle cookies!
const response = await fetch('http://localhost:5001/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // IMPORTANT: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    age: 25,
  }),
});
```

The `credentials: 'include'` ensures cookies are sent with cross-origin requests.

---

## ✅ All Tests Passed When

- ✅ Signup creates account & session
- ✅ Login authenticates & creates session
- ✅ Profile returns user data when authenticated
- ✅ Profile returns 401 when not authenticated
- ✅ Forgot password sends OTP email
- ✅ Reset password verifies OTP & updates password
- ✅ Logout destroys session
- ✅ New login works after password reset

**Happy Testing! 🚀**
