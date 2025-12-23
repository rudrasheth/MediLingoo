import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { usePlan } from "@/contexts/PlanContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { MapPin, Building2 } from "lucide-react";
import PharmacyFinder from "@/components/PharmacyFinder";
import { HospitalFinder } from "@/components/HospitalFinder";

const GlassNav = () => {
  const { t } = useLanguage();
  const { isAuthenticated, login, logout, signup } = useAuth();
  const { plan, setPlan } = usePlan();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter your full name");
      return;
    }
    
    if (!age || parseInt(age) < 1 || parseInt(age) > 150) {
      alert("Please enter a valid age (1-150)");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      await signup(email, password, parseInt(age), fullName);
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setIsSignupMode(false);
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  };

  // Upgrade dialog removed per request; keep plan state for potential future use
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const DEMO_MODE = false; // Production mode - Razorpay enabled

  const planLabel = plan === "standard" ? "Upgrade" : plan === "premium" ? "Premium" : "Pro";

  const handlePayment = async (target: "premium" | "pro") => {
    setProcessingPayment(true);
    
    // DEMO MODE - Simulate payment without Razorpay
    if (DEMO_MODE) {
      setTimeout(() => {
        setPlan(target);
        setUpgradeOpen(false);
        setProcessingPayment(false);
        alert(`✅ Demo: Successfully upgraded to ${target.charAt(0).toUpperCase() + target.slice(1)}! (Demo Mode)`);
      }, 1500);
      return;
    }

    // ⚠️ TODO: MOVE TO BACKEND ON DEPLOYMENT
    // Security: This payment logic should be moved to backend server for production:
    // 1. Backend creates Razorpay order (POST /api/payment/create-order)
    // 2. Frontend calls checkout with order ID only
    // 3. Backend verifies signature with secret key (NEVER expose in frontend code)
    // 4. Backend updates database with new plan
    // Currently in frontend for development only - move to server/routes before deploying!
    
    // PRODUCTION MODE - Real Razorpay payment
    try {
      const amount = target === "premium" ? 299 : 599;
      
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options = {
          key: "rzp_test_RtYUA2drSIhQYW", // Razorpay test key
          amount: amount * 100, // Amount in paise
          currency: "INR",
          name: "MediLingo",
          description: `${target === "premium" ? "Premium" : "Pro"} Plan Subscription`,
          image: "/medilingo-logo.png",
          handler: function (response: any) {
            // Payment successful
            console.log("Payment successful:", response);
            setPlan(target);
            setUpgradeOpen(false);
            alert(`Successfully upgraded to ${target.charAt(0).toUpperCase() + target.slice(1)}!`);
          },
          prefill: {
            email: email || "",
            name: firstName ? `${firstName} ${lastName}` : "",
          },
          theme: {
            color: "#16a34a", // Green color matching login theme
          },
          modal: {
            ondismiss: function () {
              setProcessingPayment(false);
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setProcessingPayment(false);
      };
      script.onerror = () => {
        setProcessingPayment(false);
        alert("Payment gateway unavailable. Please try again.");
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      setProcessingPayment(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="container flex items-center justify-between h-16 px-5">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <span className="font-bold text-xl text-secondary">{t.nav.appName}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Nearby Hospital */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Building2 className="w-4 h-4" />
                {t.nav.nearbyHospitals}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>{t.nav.nearbyHospitals}</DialogTitle>
                <DialogDescription>
                  {t.common.findNearby} {t.common.within1_5km}
                </DialogDescription>
              </DialogHeader>
              <HospitalFinder />
            </DialogContent>
          </Dialog>

          {/* Nearby Pharmacy */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MapPin className="w-4 h-4" />
                {t.nav.nearbyPharmacies}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>{t.nav.nearbyPharmacies}</DialogTitle>
                <DialogDescription>
                  {t.common.findNearby} {t.common.within1_5km}
                </DialogDescription>
              </DialogHeader>
              <PharmacyFinder />
            </DialogContent>
          </Dialog>
          {/* Login/Logout Button */}
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t.nav.logout}
            </Button>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  {t.nav.login}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{isSignupMode ? "Sign Up for MediLingo" : `${t.nav.login} to MediLingo`}</DialogTitle>
                  <DialogDescription>
                    {isSignupMode ? "Create a new account to get started" : "Enter your credentials to access your account"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="space-y-4 mt-4">
                  {isSignupMode && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                  {isSignupMode && (
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Your age"
                        min="1"
                        max="150"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {isSignupMode && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : (isSignupMode ? "Create Account" : "Login")}
                  </Button>
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
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Upgrade Button removed per request */}
        </div>
      </div>
    </header>
  );
};

export default GlassNav;
