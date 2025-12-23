# Code Changes Summary - Forgot Password Feature

## Files Modified

### 1. `frontend/src/contexts/AuthContext.tsx`

#### Change 1: Updated AuthContextType Interface
```typescript
// BEFORE:
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, age: number, name: string) => Promise<void>;
  logout: () => void;
}

// AFTER:
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, age: number, name: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}
```

#### Change 2: Added forgotPassword Function
```typescript
const forgotPassword = async (email: string) => {
  try {
    console.log('🔑 Requesting password reset for:', email);
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send reset email');
    }

    const data = await response.json();
    console.log('✅ Reset email sent:', data.message);
    toast({
      title: 'Reset email sent',
      description: 'Check your email for OTP and instructions',
    });
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to process password reset',
      variant: 'destructive',
    });
    throw error;
  }
};
```

#### Change 3: Added resetPassword Function
```typescript
const resetPassword = async (email: string, otp: string, newPassword: string) => {
  try {
    console.log('🔄 Resetting password for:', email);
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reset password');
    }

    const data = await response.json();
    console.log('✅ Password reset successful:', data.message);
    toast({
      title: 'Password reset successfully',
      description: 'You can now login with your new password',
    });
  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to reset password',
      variant: 'destructive',
    });
    throw error;
  }
};
```

#### Change 4: Updated Provider Export
```typescript
// BEFORE:
return (
  <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
    {children}
  </AuthContext.Provider>
);

// AFTER:
return (
  <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, forgotPassword, resetPassword }}>
    {children}
  </AuthContext.Provider>
);
```

---

### 2. `frontend/src/components/layout/GlassNav.tsx`

#### Change 1: Updated useAuth Hook Destructuring
```typescript
// BEFORE:
const { isAuthenticated, login, logout, signup } = useAuth();

// AFTER:
const { isAuthenticated, login, logout, signup, forgotPassword, resetPassword } = useAuth();
```

#### Change 2: Added Forgot Password State Variables
```typescript
// Added after existing state declarations:
// Forgot password states
const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "otp" | "reset">("email");
const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
const [otp, setOtp] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmNewPassword, setConfirmNewPassword] = useState("");
const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
```

#### Change 3: Added Handler Functions
```typescript
// Added after toggleMode() function:

const handleForgotPasswordRequest = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!forgotPasswordEmail.trim()) {
    alert("Please enter your email address");
    return;
  }

  setForgotPasswordLoading(true);
  try {
    await forgotPassword(forgotPasswordEmail);
    setForgotPasswordStep("otp");
  } catch (error) {
    console.error("Forgot password request failed:", error);
  } finally {
    setForgotPasswordLoading(false);
  }
};

const handleResetPasswordSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!otp.trim()) {
    alert("Please enter the OTP from your email");
    return;
  }

  if (!newPassword.trim() || !confirmNewPassword.trim()) {
    alert("Please enter your new password");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    alert("Passwords don't match!");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  setForgotPasswordLoading(true);
  try {
    await resetPassword(forgotPasswordEmail, otp, newPassword);
    // Reset forgot password state and close dialog
    setIsForgotPasswordOpen(false);
    setForgotPasswordStep("email");
    setForgotPasswordEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
  } catch (error) {
    console.error("Password reset failed:", error);
  } finally {
    setForgotPasswordLoading(false);
  }
};

const closeForgotPasswordDialog = () => {
  setIsForgotPasswordOpen(false);
  setForgotPasswordStep("email");
  setForgotPasswordEmail("");
  setOtp("");
  setNewPassword("");
  setConfirmNewPassword("");
};

const openForgotPassword = () => {
  setIsOpen(false);
  setIsForgotPasswordOpen(true);
};
```

#### Change 4: Enhanced Login Button UI
```typescript
// BEFORE:
<div className="text-center">
  <Button
    type="button"
    variant="link"
    onClick={toggleMode}
    className="text-sm"
  >
    {isSignupMode ? "Already have an account? Login" : "New user? Sign up"}
  </Button>
</div>

// AFTER:
<div className="text-center space-y-2">
  <div>
    <Button
      type="button"
      variant="link"
      onClick={toggleMode}
      className="text-sm"
    >
      {isSignupMode ? "Already have an account? Login" : "New user? Sign up"}
    </Button>
  </div>
  {!isSignupMode && (
    <div>
      <Button
        type="button"
        variant="link"
        onClick={openForgotPassword}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Forgot your password?
      </Button>
    </div>
  )}
</div>
```

#### Change 5: Added Forgot Password Dialog Component
```typescript
{/* Forgot Password Dialog */}
<Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Reset Your Password</DialogTitle>
      <DialogDescription>
        {forgotPasswordStep === "email" && "Enter your email address to receive a password reset code"}
        {forgotPasswordStep === "otp" && "Enter the OTP code sent to your email and set a new password"}
      </DialogDescription>
    </DialogHeader>

    {forgotPasswordStep === "email" && (
      <form onSubmit={handleForgotPasswordRequest} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="forgotEmail">Email Address</Label>
          <Input
            id="forgotEmail"
            type="email"
            placeholder="Enter your email address"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            required
            disabled={forgotPasswordLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={forgotPasswordLoading}>
          {forgotPasswordLoading ? "Sending..." : "Send Reset Code"}
        </Button>
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={closeForgotPasswordDialog}
            className="text-sm"
          >
            Back to Login
          </Button>
        </div>
      </form>
    )}

    {forgotPasswordStep === "otp" && (
      <form onSubmit={handleResetPasswordSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="otp">OTP Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit code from your email"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            disabled={forgotPasswordLoading}
          />
          <p className="text-xs text-gray-500">Check your email for the 6-digit code (valid for 10 minutes)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={forgotPasswordLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm Password</Label>
          <Input
            id="confirmNewPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            disabled={forgotPasswordLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={forgotPasswordLoading}>
          {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
        </Button>
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={closeForgotPasswordDialog}
            className="text-sm"
          >
            Back to Login
          </Button>
        </div>
      </form>
    )}
  </DialogContent>
</Dialog>
```

---

## Summary of Changes

| File | Type | Changes |
|------|------|---------|
| AuthContext.tsx | Logic | +2 functions, +2 interface methods |
| GlassNav.tsx | UI | +1 button, +1 dialog, +7 state vars, +4 handlers |

**Total Lines Added**: ~350 lines of code  
**Complexity**: Low (uses existing UI components and patterns)  
**Breaking Changes**: None (fully backward compatible)  

---

## Testing the Changes

### Unit Test Example
```typescript
// Test forgotPassword function
test('forgotPassword sends email correctly', async () => {
  const { forgotPassword } = useAuth();
  const response = await forgotPassword('test@example.com');
  expect(response.success).toBe(true);
});

// Test resetPassword function
test('resetPassword updates password correctly', async () => {
  const { resetPassword } = useAuth();
  const response = await resetPassword('test@example.com', '123456', 'newpass123');
  expect(response.success).toBe(true);
});
```

### Integration Test Example
```typescript
// Test complete flow
test('forgot password flow works end-to-end', async () => {
  // Click forgot password button
  const forgotBtn = screen.getByText(/forgot your password/i);
  fireEvent.click(forgotBtn);
  
  // Enter email
  const emailInput = screen.getByLabelText(/email address/i);
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
  // Click send
  const sendBtn = screen.getByText(/send reset code/i);
  fireEvent.click(sendBtn);
  
  // Wait for dialog to progress
  await waitFor(() => {
    expect(screen.getByLabelText(/otp code/i)).toBeInTheDocument();
  });
  
  // Enter OTP and password
  const otpInput = screen.getByLabelText(/otp code/i);
  fireEvent.change(otpInput, { target: { value: '123456' } });
  
  // ... continue test
});
```

---

**Documentation Created**: December 23, 2025
