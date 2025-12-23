export type Language = 'en' | 'hi' | 'mr' | 'bn';

export interface Translations {
  nav: {
    appName: string;
    login: string;
    logout: string;
    nearbyHospitals: string;
    nearbyPharmacies: string;
  };
  hero: {
    trustBadge: string;
    title1: string;
    title2: string;
    title3: string;
    subtitle: string;
    scanButton: string;
    noAccount: string;
    headline: string;
    dropOrScan: string;
    uploadExplain: string;
    takePhotoBtn: string;
    uploadFileBtn: string;
    chatPlaceholder: string;
    instantScan: string;
    aiRecognition: string;
    pharmacyFinder: string;
    hospitalFinder: string;
  };
  upload: {
    title: string;
    subtitle: string;
    dragDrop: string;
    or: string;
    takePhoto: string;
    chooseFile: string;
    supportedFormats: string;
    processing: string;
    success: string;
    cancel: string;
  };
  dashboard: {
    title: string;
    todaySchedule: string;
    dailyProgress: string;
    taken: string;
    of: string;
    morning: string;
    afternoon: string;
    night: string;
    markAsTaken: string;
    takenLabel: string;
    missedDose: string;
    listenInstructions: string;
    noMedicines: string;
  };
  common: {
    back: string;
    notifications: string;
    findNearby: string;
    findNearbyShort: string;
    within1_5km: string;
    useCamera: string;
    uploadFromGallery: string;
    chooseUploadMethod: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      appName: 'MediLingo',
      login: 'Login',
      logout: 'Logout',
      nearbyHospitals: 'Nearby Hospitals',
      nearbyPharmacies: 'Nearby Pharmacies',
    },
    hero: {
      trustBadge: 'Trusted by 50,000+ families',
      title1: 'Understand Your',
      title2: 'Prescriptions',
      title3: 'In Seconds',
      subtitle: "Simply take a photo. We'll explain your medicines in plain, simple words.",
      scanButton: 'Scan Prescription',
      noAccount: 'No account needed • Free to use',
      headline: 'Your Health, Deciphered',
      dropOrScan: 'Drop or Scan Prescription',
      uploadExplain: 'Take a photo of your prescription or upload an image file',
      takePhotoBtn: 'Take Photo',
      uploadFileBtn: 'Upload File',
      chatPlaceholder: 'Ask me anything about your prescription...',
      instantScan: 'Instant Scan',
      aiRecognition: 'AI Recognition',
      pharmacyFinder: 'Pharmacy Finder',
      hospitalFinder: 'Hospital Finder',
    },
    upload: {
      title: 'Upload Prescription',
      subtitle: 'Take a clear photo of your prescription',
      dragDrop: 'Drag and drop your image here',
      or: 'or',
      takePhoto: 'Take Photo',
      chooseFile: 'Choose from Gallery',
      supportedFormats: 'Supports JPG, PNG, PDF',
      processing: 'Reading your prescription...',
      success: 'Prescription Received',
      cancel: 'Cancel',
    },
    dashboard: {
      title: 'Your Medicines',
      todaySchedule: "Today's Schedule",
      dailyProgress: 'Daily Progress',
      taken: 'taken',
      of: 'of',
      morning: 'Morning',
      afternoon: 'Afternoon',
      night: 'Night',
      markAsTaken: 'Mark as Taken',
      takenLabel: 'Taken',
      missedDose: 'Missed Dose - Take Now',
      listenInstructions: 'Listen to instructions',
      noMedicines: 'No medicines scheduled',
    },
    common: {
      back: 'Go back',
      notifications: 'Notifications',
      findNearby: 'Find nearby',
      findNearbyShort: 'Find nearby',
      within1_5km: '(1.5km)',
      useCamera: 'Use Camera',
      uploadFromGallery: 'Upload from Gallery',
      chooseUploadMethod: "Choose how you'd like to upload your prescription",
    },
  },
  hi: {
    nav: {
      appName: 'मेडीलिंगो',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      nearbyHospitals: 'पास के अस्पताल',
      nearbyPharmacies: 'पास की फार्मेसी',
    },
    hero: {
      trustBadge: '50,000+ परिवारों द्वारा विश्वसनीय',
      title1: 'अपनी दवाओं को',
      title2: 'समझें',
      title3: 'सेकंडों में',
      subtitle: 'बस एक फोटो लें। हम आपकी दवाइयों को सरल शब्दों में समझाएंगे।',
      scanButton: 'पर्चा स्कैन करें',
      noAccount: 'खाते की जरूरत नहीं • मुफ्त उपयोग',
      headline: 'आपका स्वास्थ्य, समझाया गया',
      dropOrScan: 'प्रिस्क्रिप्शन ड्रॉप करें या स्कैन करें',
      uploadExplain: 'अपने पर्चे की फोटो लें या इमेज अपलोड करें',
      takePhotoBtn: 'फोटो लें',
      uploadFileBtn: 'फाइल अपलोड करें',
      chatPlaceholder: 'अपनी पर्ची के बारे में कुछ भी पूछें...',
      instantScan: 'तुरंत स्कैन',
      aiRecognition: 'एआई पहचान',
      pharmacyFinder: 'फार्मेसी खोजें',
      hospitalFinder: 'अस्पताल खोजें',
    },
    upload: {
      title: 'पर्चा अपलोड करें',
      subtitle: 'अपने पर्चे की स्पष्ट तस्वीर लें',
      dragDrop: 'अपनी छवि यहाँ खींचें और छोड़ें',
      or: 'या',
      takePhoto: 'फोटो लें',
      chooseFile: 'गैलरी से चुनें',
      supportedFormats: 'JPG, PNG, PDF समर्थित',
      processing: 'आपका पर्चा पढ़ा जा रहा है...',
      success: 'पर्चा प्राप्त हुआ',
      cancel: 'रद्द करें',
    },
    dashboard: {
      title: 'आपकी दवाइयाँ',
      todaySchedule: 'आज का कार्यक्रम',
      dailyProgress: 'दैनिक प्रगति',
      taken: 'ली गई',
      of: 'में से',
      morning: 'सुबह',
      afternoon: 'दोपहर',
      night: 'रात',
      markAsTaken: 'ली गई के रूप में चिह्नित करें',
      takenLabel: 'ली गई',
      missedDose: 'खुराक छूट गई - अभी लें',
      listenInstructions: 'निर्देश सुनें',
      noMedicines: 'कोई दवाई निर्धारित नहीं',
    },
    common: {
      back: 'वापस जाएं',
      notifications: 'सूचनाएं',
      findNearby: 'पास में खोजें',
      findNearbyShort: 'पास में',
      within1_5km: '(1.5किमी)',
      useCamera: 'कैमरा उपयोग करें',
      uploadFromGallery: 'गैलरी से अपलोड',
      chooseUploadMethod: 'अपलोड करने का तरीका चुनें',
    },
  },
  mr: {
    nav: {
      appName: 'मेडीलिंगो',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      nearbyHospitals: 'जवळचे रुग्णालय',
      nearbyPharmacies: 'जवळची फार्मसी',
    },
    hero: {
      trustBadge: '50,000+ कुटुंबांचा विश्वास',
      title1: 'तुमची औषधे',
      title2: 'समजून घ्या',
      title3: 'काही सेकंदात',
      subtitle: 'फक्त एक फोटो घ्या. आम्ही तुमची औषधे सोप्या शब्दांत समजावून सांगू.',
      scanButton: 'प्रिस्क्रिप्शन स्कॅन करा',
      noAccount: 'खात्याची गरज नाही • मोफत वापर',
      headline: 'तुमचे आरोग्य, समजावून',
      dropOrScan: 'प्रिस्क्रिप्शन ड्रॉप करा किंवा स्कॅन करा',
      uploadExplain: 'प्रिस्क्रिप्शनचा फोटो घ्या किंवा प्रतिमा अपलोड करा',
      takePhotoBtn: 'फोटो घ्या',
      uploadFileBtn: 'फाईल अपलोड करा',
      chatPlaceholder: 'तुमच्या पर्च्याबद्दल काहीही विचारा...',
      instantScan: 'इन्स्टंट स्कॅन',
      aiRecognition: 'एआय ओळख',
      pharmacyFinder: 'फार्मसी शोधा',
      hospitalFinder: 'रुग्णालय शोधा',
    },
    upload: {
      title: 'प्रिस्क्रिप्शन अपलोड करा',
      subtitle: 'तुमच्या प्रिस्क्रिप्शनचा स्पष्ट फोटो घ्या',
      dragDrop: 'तुमची प्रतिमा इथे ड्रॅग आणि ड्रॉप करा',
      or: 'किंवा',
      takePhoto: 'फोटो घ्या',
      chooseFile: 'गॅलरीतून निवडा',
      supportedFormats: 'JPG, PNG, PDF समर्थित',
      processing: 'तुमचे प्रिस्क्रिप्शन वाचत आहे...',
      success: 'प्रिस्क्रिप्शन प्राप्त झाले',
      cancel: 'रद्द करा',
    },
    dashboard: {
      title: 'तुमची औषधे',
      todaySchedule: 'आजचे वेळापत्रक',
      dailyProgress: 'दैनिक प्रगती',
      taken: 'घेतली',
      of: 'पैकी',
      morning: 'सकाळ',
      afternoon: 'दुपार',
      night: 'रात्र',
      markAsTaken: 'घेतले म्हणून नोंदवा',
      takenLabel: 'घेतले',
      missedDose: 'डोस चुकला - आता घ्या',
      listenInstructions: 'सूचना ऐका',
      noMedicines: 'कोणतीही औषधे नियोजित नाहीत',
    },
    common: {
      back: 'मागे जा',
      notifications: 'सूचना',
      findNearby: 'जवळ शोधा',
      findNearbyShort: 'जवळ',
      within1_5km: '(1.5किमी)',
      useCamera: 'कॅमेरा वापरा',
      uploadFromGallery: 'गॅलरीतून अपलोड',
      chooseUploadMethod: 'अपलोड कसे कराल ते निवडा',
    },
  },
  bn: {
    nav: {
      appName: 'মেডিলিংগো',
      login: 'লগইন',
      logout: 'লগআউট',
      nearbyHospitals: 'নিকটবর্তী হাসপাতাল',
      nearbyPharmacies: 'নিকটবর্তী ফার্মেসি',
    },
    hero: {
      trustBadge: '৫০,০০০+ পরিবারের ভরসা',
      title1: 'আপনার ওষুধ',
      title2: 'বোঝুন',
      title3: 'সেকেন্ডে',
      subtitle: 'শুধু একটি ছবি তুলুন। আমরা সহজ ভাষায় ওষুধের নির্দেশনা বুঝিয়ে দেব।',
      scanButton: 'প্রেসক্রিপশন স্ক্যান করুন',
      noAccount: 'অ্যাকাউন্টের প্রয়োজন নেই • ফ্রি',
      headline: 'আপনার স্বাস্থ্য, সহজভাবে',
      dropOrScan: 'প্রেসক্রিপশন ড্রপ করুন বা স্ক্যান করুন',
      uploadExplain: 'প্রেসক্রিপশনের ছবি তুলুন বা ইমেজ আপলোড করুন',
      takePhotoBtn: 'ছবি তুলুন',
      uploadFileBtn: 'ফাইল আপলোড করুন',
      chatPlaceholder: 'আপনার প্রেসক্রিপশন নিয়ে যেকোন প্রশ্ন করুন...',
      instantScan: 'ইনস্ট্যান্ট স্ক্যান',
      aiRecognition: 'এআই রিকগনিশন',
      pharmacyFinder: 'ফার্মেসি খুঁজুন',
      hospitalFinder: 'হাসপাতাল খুঁজুন',
    },
    upload: {
      title: 'প্রেসক্রিপশন আপলোড করুন',
      subtitle: 'আপনার প্রেসক্রিপশনের একটি পরিষ্কার ছবি তুলুন',
      dragDrop: 'ছবিটি এখানে ড্র্যাগ ও ড্রপ করুন',
      or: 'অথবা',
      takePhoto: 'ছবি তুলুন',
      chooseFile: 'গ্যালারি থেকে বাছাই করুন',
      supportedFormats: 'JPG, PNG, PDF সমর্থিত',
      processing: 'আপনার প্রেসক্রিপশন পড়া হচ্ছে...',
      success: 'প্রেসক্রিপশন পাওয়া গেছে',
      cancel: 'বাতিল',
    },
    dashboard: {
      title: 'আপনার ওষুধ',
      todaySchedule: 'আজকের সূচি',
      dailyProgress: 'দৈনিক অগ্রগতি',
      taken: 'খাওয়া হয়েছে',
      of: 'এর',
      morning: 'সকাল',
      afternoon: 'দুপুর',
      night: 'রাত',
      markAsTaken: 'খাওয়া হয়েছে হিসেবে চিহ্নিত করুন',
      takenLabel: 'খাওয়া',
      missedDose: 'ডোজ মিস হয়েছে - এখন নিন',
      listenInstructions: 'নির্দেশনা শুনুন',
      noMedicines: 'কোনো ওষুধ নির্ধারিত নেই',
    },
    common: {
      back: 'ফিরে যান',
      notifications: 'বিজ্ঞপ্তি',
      findNearby: 'কাছাকাছি খুঁজুন',
      findNearbyShort: 'কাছাকাছি',
      within1_5km: '(১.৫কিমি)',
      useCamera: 'ক্যামেরা ব্যবহার করুন',
      uploadFromGallery: 'গ্যালারি থেকে আপলোড',
      chooseUploadMethod: 'আপলোড করার পদ্ধতি বাছাই করুন',
    },
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
  bn: 'বাংলা',
};
