import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS  
    }
  });
};

// Send email function
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Backend System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send a test email to the specified address
export const sendTestEmail = async () => {
  const to = 'abdulsalamopeyemi064@yahoo.com';
  const subject = 'Test Email from Node.js App';
  const text = 'This is a test email sent from your Node.js application using Nodemailer!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hello from Node.js!</h2>
      <p>This is a test email sent from your Node.js application using Nodemailer.</p>
      <p>If you're receiving this email, the email service is working correctly! 🎉</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
    </div>
  `;

  return await sendEmail(to, subject, text, html);
};

export default { sendEmail, sendTestEmail };
