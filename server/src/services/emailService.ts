import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } from '../config/env';

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email to user
 * @param email - Recipient email address
 * @param otp - One-Time Password to send
 * @returns Promise<boolean> - Success/failure status
 */
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Email HTML template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin-top: 0;">MediLingo</h2>
          <p style="color: #666; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="padding: 30px 20px; text-align: center;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your password. Use the OTP below to proceed:
          </p>
          
          <div style="background-color: #007bff; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          
          <p style="color: #999; font-size: 12px;">
            If you didn't request a password reset, please ignore this email or contact our support team.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 MediLingo. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"MediLingo" <${EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - MediLingo',
      html: htmlTemplate,
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

/**
 * Send welcome email to new user
 * @param email - Recipient email address
 * @param name - User's name
 * @returns Promise<boolean> - Success/failure status
 */
export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin-top: 0;">🎉 Welcome to MediLingo!</h2>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="color: #333; font-size: 16px;">
            Hello <strong>${name}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for signing up with MediLingo! We're excited to have you on board.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            With MediLingo, you can:
          </p>
          
          <ul style="color: #666; font-size: 16px;">
            <li>📋 Manage your prescriptions efficiently</li>
            <li>💊 Get medicine recommendations</li>
            <li>🏥 Find nearby hospitals and pharmacies</li>
            <li>💬 Chat with our AI assistant</li>
          </ul>
          
          <p style="color: #666; font-size: 16px; margin-top: 20px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 MediLingo. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"MediLingo" <${EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to MediLingo!',
      html: htmlTemplate,
      text: `Welcome to MediLingo, ${name}! Thank you for signing up.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Test the email transporter connection
 */
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email service connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return false;
  }
};
