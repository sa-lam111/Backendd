import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Simple test with different email providers
const testEmailProviders = async () => {
  const to = 'abdulsalamopeyemi064@yahoo.com';
  const subject = 'Test Email from Node.js';
  const text = 'This is a test email!';
  
  // Test 1: Try with Outlook/Hotmail
  console.log('🔄 Testing Outlook/Hotmail...');
  try {
    const outlookTransporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const result = await outlookTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    });
    
    console.log('✅ Outlook email sent successfully!', result.messageId);
    return;
  } catch (error) {
    console.log('❌ Outlook failed:', error.message);
  }

  // Test 2: Try with custom SMTP settings
  console.log('🔄 Testing custom SMTP...');
  try {
    const customTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const result = await customTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    });
    
    console.log('✅ Custom SMTP email sent successfully!', result.messageId);
    return;
  } catch (error) {
    console.log('❌ Custom SMTP failed:', error.message);
  }

  console.log('❌ All email methods failed. Please check your credentials.');
};

// Check if credentials are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ Please set EMAIL_USER and EMAIL_PASS in your .env file');
  console.log('Example:');
  console.log('EMAIL_USER=your_email@gmail.com');
  console.log('EMAIL_PASS=your_password');
} else {
  console.log('📧 Testing email to: abdulsalamopeyemi064@yahoo.com');
  testEmailProviders();
}
