import express from 'express';
import { sendTestEmail, sendEmail } from '../services/email.service.js';

const router = express.Router();

// Route to send test email
router.post('/send-test', async (req, res) => {
  try {
    const result = await sendTestEmail();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Route to send custom email
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    // Validate required fields
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, text'
      });
    }

    const result = await sendEmail(to, subject, text, html);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
