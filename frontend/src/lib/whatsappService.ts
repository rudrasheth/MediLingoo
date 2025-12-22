interface ShareOptions {
  type: 'prescription' | 'medicine' | 'reminder';
  content: string;
  phoneNumber?: string;
}

export const whatsappService = {
  /**
   * Share content via WhatsApp
   * Opens WhatsApp with pre-filled message
   */
  share: (options: ShareOptions) => {
    const { content, phoneNumber } = options;
    
    if (!phoneNumber) {
      console.error('Phone number is required for WhatsApp sharing');
      return;
    }

    // Remove any non-numeric characters except + from phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(content);
    
    // Create WhatsApp URL
    // For web: https://wa.me/PHONENUMBER?text=MESSAGE
    // For mobile: whatsapp://send?phone=PHONENUMBER&text=MESSAGE
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let whatsappUrl = '';
    
    if (isMobile) {
      whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
    } else {
      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  },

  /**
   * Generate prescription summary for sharing
   */
  generatePrescriptionSummary: (medicines: any[], prescriptionText: string): string => {
    const medicineList = medicines
      .map((m) => `• ${m.name}${m.dosage ? ` - ${m.dosage}` : ''}`)
      .join('\n');

    return `📋 *Prescription Summary*\n\n*Medicines:*\n${medicineList}\n\n*Full Text:*\n${prescriptionText}\n\n📱 Shared via MediLingo`;
  },

  /**
   * Generate medicine reminder message
   */
  generateReminderMessage: (
    medicineName: string,
    dosage: string,
    times: string[]
  ): string => {
    return `💊 *Medicine Reminder*\n\n*Medicine:* ${medicineName}\n*Dosage:* ${dosage}\n*Times:* ${times.join(', ')}\n\n📱 Set via MediLingo`;
  },

  /**
   * Check if WhatsApp is installed/available
   */
  isAvailable: (): boolean => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isMobile || typeof window !== 'undefined';
  },
};
