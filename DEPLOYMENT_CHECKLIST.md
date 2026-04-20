# Deployment & Testing Checklist - Forgot Password Feature

## Pre-Deployment Verification

### ✅ Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No console warnings in browser development tools
- [ ] No missing imports or undefined variables
- [ ] Code follows existing project patterns and style
- [ ] All state variables properly initialized
- [ ] No memory leaks (dialogs properly clean up)

### ✅ Backend Configuration
- [ ] Backend server running on `http://localhost:5001`
- [ ] MongoDB database connection established
- [ ] Email service properly configured
- [ ] SMTP credentials valid and tested
- [ ] OTP generation service working
- [ ] Session/cookie middleware enabled

### ✅ Frontend Configuration
- [ ] Frontend running on dev server
- [ ] `VITE_API_URL` environment variable set to `http://localhost:5001`
- [ ] AuthProvider wrapping entire application
- [ ] All UI components imported correctly
- [ ] Tailwind CSS classes available

---

## Functional Testing

### 🧪 Test Suite 1: Basic Flow
```
Test Case 1.1: Open Forgot Password Dialog
├─ Action: Click "Login" button
├─ Action: Click "Forgot your password?" link
└─ Expected: Dialog opens with email input visible

Test Case 1.2: Send Reset Code
├─ Action: Enter valid registered email
├─ Action: Click "Send Reset Code" button
├─ Expected: Toast shows "Reset email sent"
└─ Expected: Dialog progresses to OTP step

Test Case 1.3: Receive Email
├─ Action: Check inbox for reset email
└─ Expected: Email received with OTP code

Test Case 1.4: Enter OTP and Password
├─ Action: Enter OTP from email (6 digits)
├─ Action: Enter new password (min 6 chars)
├─ Action: Confirm password (must match)
└─ Expected: All fields filled, button enabled

Test Case 1.5: Submit Reset
├─ Action: Click "Reset Password" button
├─ Expected: Toast shows "Password reset successfully"
├─ Expected: Dialog closes
└─ Expected: Navigate back to login

Test Case 1.6: Login with New Password
├─ Action: Click "Login" button
├─ Action: Enter email and NEW password
├─ Action: Click "Login"
└─ Expected: Login successful, redirected to app
```

### 🧪 Test Suite 2: Error Handling
```
Test Case 2.1: Invalid Email
├─ Action: Enter unregistered email
├─ Action: Click "Send Reset Code"
└─ Expected: Error toast "Invalid email or user not found"

Test Case 2.2: Wrong OTP
├─ Action: Enter incorrect 6-digit code
├─ Action: Click "Reset Password"
└─ Expected: Error toast "Invalid OTP"

Test Case 2.3: Expired OTP
├─ Action: Wait 10+ minutes
├─ Action: Enter OTP
├─ Action: Click "Reset Password"
└─ Expected: Error toast "OTP has expired"

Test Case 2.4: Password Mismatch
├─ Action: Enter different passwords in both fields
└─ Expected: Alert "Passwords don't match!"

Test Case 2.5: Weak Password
├─ Action: Enter password with < 6 characters
└─ Expected: Alert "Password must be at least 6 characters"

Test Case 2.6: Empty OTP
├─ Action: Click "Reset Password" without entering OTP
└─ Expected: Alert "Please enter the OTP from your email"
```

### 🧪 Test Suite 3: UI/UX
```
Test Case 3.1: Button States
├─ Action: Send reset code
├─ Expected: Button text changes to "Sending..."
├─ Expected: Button disabled while loading
└─ Expected: Button re-enabled after response

Test Case 3.2: Loading States
├─ Action: Perform any async operation
├─ Expected: Loading spinner/text visible
└─ Expected: UI prevents multiple submissions

Test Case 3.3: Navigation
├─ Action: Click "Back to Login" from any step
├─ Expected: Dialog closes
├─ Expected: All form fields cleared
└─ Expected: Can open login dialog again

Test Case 3.4: Dialog Closure
├─ Action: Click X button on dialog
├─ Expected: Dialog closes cleanly
└─ Expected: Form state reset

Test Case 3.5: Multiple Attempts
├─ Action: Click forgot password multiple times
├─ Expected: Each attempt starts fresh
└─ Expected: No state spillover between attempts
```

### 🧪 Test Suite 4: Integration
```
Test Case 4.1: Login Dialog Closed When Opening Forgot Password
├─ Action: Have login dialog open
├─ Action: Click "Forgot your password?"
├─ Expected: Login dialog closes
└─ Expected: Forgot password dialog opens

Test Case 4.2: Proper API Communication
├─ Action: Open browser Network tab
├─ Action: Send reset request
├─ Expected: POST to /api/auth/forgot-password
├─ Expected: Request has correct headers
└─ Expected: Response status is 200

Test Case 4.3: Email Service Integration
├─ Action: Request password reset
├─ Expected: Email sent within 2 seconds
├─ Expected: Email contains OTP
├─ Expected: Email format is readable

Test Case 4.4: Database Updates
├─ Action: Complete password reset
├─ Expected: User password changed in database
├─ Expected: Old password no longer works
└─ Expected: New password works for login
```

---

## Browser Testing

### 🌐 Cross-Browser Compatibility
- [ ] Chrome/Chromium (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)

### 📱 Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

### ♿ Accessibility
- [ ] All inputs have labels
- [ ] Form can be submitted with Tab+Enter
- [ ] Error messages announced to screen readers
- [ ] Color contrast meets WCAG AA standards
- [ ] Dialog properly trapped focus

---

## Performance Testing

### ⚡ Load Testing
```
Metric: Page Load Time
├─ Before Reset Form: < 100ms
├─ After Dialog Open: < 200ms
└─ After API Call: < 2000ms

Metric: Memory Usage
├─ Dialog Open: +5MB max
├─ Dialog Close: Properly released
└─ No memory leaks after 10 opens/closes

Metric: API Response Time
├─ Forgot Password Request: < 1000ms
├─ Reset Password Request: < 1000ms
└─ Email Delivery: < 5000ms
```

### 🔋 Resource Usage
- [ ] Bundle size impact < 10KB (gzipped)
- [ ] No console warnings or errors
- [ ] No unused re-renders
- [ ] Proper cleanup in useEffect hooks

---

## Security Testing

### 🔒 Security Checklist
```
Authentication & Authorization
├─ [ ] OTP not exposed in URL
├─ [ ] OTP not logged in console
├─ [ ] Password not sent in plaintext
├─ [ ] Session cookie secure flag set
├─ [ ] Password never shown in network tab (HTTPS)

Input Validation
├─ [ ] Email format validation
├─ [ ] OTP length validation
├─ [ ] Password length validation
├─ [ ] SQL injection prevention
├─ [ ] XSS prevention in inputs

API Security
├─ [ ] Rate limiting on reset endpoints
├─ [ ] CORS properly configured
├─ [ ] No sensitive data in error messages
├─ [ ] HTTPS enforced in production
├─ [ ] API keys not exposed

Password Security
├─ [ ] Bcrypt hashing (min 10 rounds)
├─ [ ] No password hints stored
├─ [ ] Previous passwords not reusable
├─ [ ] Password complexity enforced
```

---

## Deployment Steps

### Step 1: Prepare Environment
```bash
# Backend
cd server
npm install  # (if any new deps)
npm run build
npm start

# Frontend
cd ../frontend
npm install  # (if any new deps)
npm run dev
```

### Step 2: Run Tests
```bash
# Backend
npm test

# Frontend
npm test
npm run build  # Check for build errors
```

### Step 3: Verify All Tests Pass
- [ ] No test failures
- [ ] No console errors
- [ ] Build completes successfully
- [ ] No TypeScript errors

### Step 4: Manual Smoke Test
```
Quick Flow:
1. Open app
2. Click Login
3. Click Forgot Password
4. Enter email → Send
5. Check email for OTP
6. Enter OTP + password → Reset
7. Login with new password
```

### Step 5: Deploy
```bash
# Backend deployment
# (Based on your hosting provider)

# Frontend deployment
npm run build
# Deploy dist/ folder to hosting
```

---

## Post-Deployment Monitoring

### 📊 Metrics to Monitor
```
✓ Email delivery rate
  Target: 99%+
  Check: Email logs

✓ OTP success rate
  Target: 95%+
  Check: API response logs

✓ Password reset completion
  Target: 90%+
  Check: Database audit logs

✓ Average API response time
  Target: < 500ms
  Check: APM tool

✓ Error rate on endpoints
  Target: < 1%
  Check: Error tracking service
```

### 🐛 Error Tracking
- [ ] Set up error logging for forgot-password endpoint
- [ ] Set up error logging for reset-password endpoint
- [ ] Monitor toast notification displays
- [ ] Track failed OTP attempts

### 📝 Logging
- [ ] All API calls logged with timestamps
- [ ] Failed OTP attempts logged
- [ ] Password reset successes logged
- [ ] Email delivery logged

---

## Rollback Plan

### If Issues Arise:
1. **Critical Bug Found**: Revert commits using `git revert`
2. **Database Issues**: Restore from backup
3. **API Issues**: Check backend logs for errors
4. **Frontend Issues**: Check browser console for errors
5. **Email Issues**: Check email service configuration

### Rollback Commands:
```bash
# Git rollback
git revert <commit-hash>
git push origin main

# Database rollback
# (Restore from backup using your admin tools)

# Re-deploy
npm run build && deploy
```

---

## Sign-Off Checklist

### Development Team
- [ ] Code reviewed by peer
- [ ] All tests passing
- [ ] No console errors
- [ ] Documentation complete

### QA Team
- [ ] Manual testing complete
- [ ] All test cases passed
- [ ] Error scenarios tested
- [ ] Browser compatibility verified

### Product Team
- [ ] User flow approved
- [ ] UI/UX meets standards
- [ ] Error messages acceptable
- [ ] Ready for production

---

## Troubleshooting Guide

### Issue: "OTP not received"
**Solution**:
1. Check spam folder
2. Verify email in database
3. Check email service logs
4. Resend OTP if within retry limit

### Issue: "Reset password fails"
**Solution**:
1. Verify OTP is correct
2. Check OTP hasn't expired
3. Verify password meets requirements
4. Check database connection

### Issue: "Can't login with new password"
**Solution**:
1. Verify password was hashed correctly
2. Check password storage in database
3. Verify no session cookie issues
4. Clear browser cache/cookies

### Issue: "Dialog not opening"
**Solution**:
1. Check AuthContext is properly exported
2. Verify state variables initialized
3. Check no JavaScript errors in console
4. Verify Dialog component imported

### Issue: "API calls failing"
**Solution**:
1. Verify backend is running
2. Check VITE_API_URL is correct
3. Verify CORS configuration
4. Check network tab for request details

---

## Final Checklist Before Release

- [ ] All code committed and pushed
- [ ] Documentation created and accessible
- [ ] All tests passing locally
- [ ] No console warnings or errors
- [ ] Backend and frontend can communicate
- [ ] Email service working
- [ ] Database backup created
- [ ] Team trained on new feature
- [ ] Monitoring/logging enabled
- [ ] Rollback plan documented
- [ ] User documentation ready
- [ ] Ready for deployment ✅

---

**Last Updated**: December 23, 2025  
**Status**: Ready for Testing & Deployment 🚀
