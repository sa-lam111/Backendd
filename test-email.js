import { sendTestEmail } from './src/services/email.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Testing email functionality...');
console.log('📧 Sending test email to: abdulsalamopeyemi064@yahoo.com');

// Check if email credentials are configured
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Email credentials not configured!');
  console.log('Please add the following to your .env file:');
  console.log('EMAIL_USER=your_gmail_address@gmail.com');
  console.log('EMAIL_PASS=your_gmail_app_password');
  process.exit(1);
}

// Send the test email
sendTestEmail()
  .then(result => {
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send email:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
