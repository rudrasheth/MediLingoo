import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import GlassNav from "@/components/layout/GlassNav";
import HeroSection from "@/components/landing/HeroSection";
import DashboardView from "@/components/dashboard/DashboardView";
import SimplePrescriptionPage from "@/components/SimplePrescriptionPage";
import PhotoUpload from "@/components/upload/PhotoUpload";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { PlanProvider, usePlan } from "@/contexts/PlanContext";
import { MedicineHistoryProvider } from "@/contexts/MedicineHistoryContext";
import { toast } from "@/components/ui/use-toast";
import { useAiScan } from "@/hooks/useAiScan";
import { useAuth } from "@/contexts/AuthContext";

type View = "landing" | "upload" | "dashboard" | "prescription-chatbot";

const IndexContent = () => {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [isProcessing, setIsProcessing] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [decipherText, setDecipherText] = useState<string | null>(null);
  const { t } = useLanguage();
  const { plan, canUseScan, recordScan, usage } = usePlan();
  const { scan, progress } = useAiScan();
  const { isAuthenticated } = useAuth();

  // Control scroll: disable on landing, enable elsewhere
  useEffect(() => {
    const shouldHideScroll = currentView === "landing";
    document.body.style.overflow = shouldHideScroll ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentView]);

  // Prevent unauthenticated users from staying on chatbot view
  useEffect(() => {
    if (currentView === "prescription-chatbot" && !isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to access the chatbot.",
        variant: "destructive",
      });
      setCurrentView("landing");
    }
  }, [currentView, isAuthenticated]);

  const handleScanClick = () => {
    if (!canUseScan()) {
      toast({
        title: "Scan limit reached",
        description:
          plan === "standard"
            ? `Standard plan allows 5 scans/month. Used: ${usage.scansThisMonth}. Upgrade for more.`
            : plan === "premium"
            ? `Premium plan allows 50 scans/month. Used: ${usage.scansThisMonth}. Upgrade to Pro for unlimited.`
            : "You have reached a temporary limit.",
        variant: "destructive",
      });
      return;
    }

    // Block chatbot access for logged-out users
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to use the chatbot experience.",
        variant: "destructive",
      });
      // Keep them on landing/upload without entering chatbot flow
      setCurrentView("landing");
      return;
    }
    
    // Check for manually entered text
    const manualText = sessionStorage.getItem('manualPrescriptionText');
    if (manualText) {
      setDecipherText(manualText);
      sessionStorage.removeItem('manualPrescriptionText');
      recordScan();
      setCurrentView("dashboard");
      return;
    }
    
    // Go to new prescription + chatbot page
    setCurrentView("prescription-chatbot");
  };

  const handleFileSelected = (file: File) => {
    // Store file temporarily to be processed in PhotoUpload
    sessionStorage.setItem('selectedFile', file.name);
    // Directly call handleUpload with the selected file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    setDecipherText(null);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrescriptionImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    try {
      const text = await scan(file);
      setDecipherText(text);
      
      const isServerDown = text.includes('could not reach');
      if (!isServerDown) {
        toast({ title: "Scan complete", description: "We deciphered your prescription." });
      } else {
        toast({ title: "Using demo mode", description: "Server offline. Showing sample data.", variant: "default" });
      }

      if (plan === 'premium' && !isServerDown) {
        try {
          const uid = (() => {
            const existing = localStorage.getItem('medilingo_user_id');
            if (existing) return existing;
            const gen = Math.random().toString(36).slice(2);
            localStorage.setItem('medilingo_user_id', gen);
            return gen;
          })();
          await fetch('http://localhost:4000/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid, imageUrl: prescriptionImage, text }),
          });
        } catch (e) {
          // ignore failures silently for now
        }
      }

      recordScan();
      setIsProcessing(false);

      // Only allow chatbot view if logged in
      if (isAuthenticated) {
        setCurrentView("prescription-chatbot");
      } else {
        toast({
          title: "Login required",
          description: "Please login to continue to the chatbot.",
          variant: "destructive",
        });
        setCurrentView("landing");
      }
    } catch (e) {
      setIsProcessing(false);
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleCancelUpload = () => {
    setCurrentView("landing");
    setIsProcessing(false);
    setPrescriptionImage(null);
  };

  if (currentView === "prescription-chatbot") {
    return (
      <>
        <Helmet>
          <title>Prescription & Medicine Assistant | MediLingo</title>
          <meta name="description" content="Upload prescription and chat with medicine assistant." />
        </Helmet>
        <div className="min-h-screen bg-background pt-16">
          <GlassNav />
          <SimplePrescriptionPage
            onBack={() => {
              setCurrentView("landing");
              setPrescriptionImage(null);
              setDecipherText(null);
            }}
            prescriptionText={decipherText}
            prescriptionImage={prescriptionImage}
          />
        </div>
      </>
    );
  }

  if (currentView === "dashboard") {
    return (
      <>
        <Helmet>
          <title>{t.dashboard.title} | MediLingo</title>
          <meta name="description" content="View your daily medicine schedule with clear instructions and reminders." />
        </Helmet>
        <DashboardView 
          onBack={() => {
            setCurrentView("landing");
            setPrescriptionImage(null);
            setDecipherText(null);
          }} 
          prescriptionImage={prescriptionImage}
          decipherText={decipherText}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>MediLingo - {t.hero.title2} {t.hero.title3}</title>
        <meta name="description" content={t.hero.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Helmet>
      
      <div className="min-h-screen bg-background pt-16">
        <GlassNav />
        <HeroSection onScanClick={handleScanClick} onFileSelected={handleFileSelected} />
        
        {currentView === "upload" && (
          <PhotoUpload 
            onUpload={handleUpload}
            onCancel={handleCancelUpload}
            isProcessing={isProcessing}
          />
        )}
        
        {isProcessing && progress > 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="font-semibold text-lg mb-2">Scanning prescription...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{progress}% complete</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <PlanProvider>
        <MedicineHistoryProvider>
          <IndexContent />
        </MedicineHistoryProvider>
      </PlanProvider>
    </LanguageProvider>
  );
};

export default Index;
