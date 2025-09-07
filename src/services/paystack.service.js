import Paystack from 'paystack';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Paystack with your secret key
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

// Initialize payment - Backend creates payment request
export const initializePayment = async (email, amount, reference, metadata = {}) => {
  try {
    const response = await paystack.transaction.initialize({
      email: email,
      amount: amount * 100, // Paystack expects amount in kobo (multiply by 100)
      reference: reference,
      metadata: metadata,
      callback_url: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3001/orders/verify'
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify payment - Backend verifies payment status
export const verifyPayment = async (reference) => {
  try {
    const response = await paystack.transaction.verify(reference);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Paystack verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create customer - Backend manages customer data
export const createCustomer = async (email, firstName, lastName, phone = null) => {
  try {
    const response = await paystack.customer.create({
      email: email,
      first_name: firstName,
      last_name: lastName,
      phone: phone
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Paystack customer creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get customer - Backend retrieves customer info
export const getCustomer = async (email) => {
  try {
    const response = await paystack.customer.list({
      email: email
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Paystack get customer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate unique reference for each payment
export const generateReference = () => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Handle webhook - Backend processes Paystack notifications
export const handleWebhook = async (payload, signature) => {
  try {
    // Verify webhook signature (important for security)
    const crypto = await import('crypto');
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      return {
        success: false,
        error: 'Invalid signature'
      };
    }

    // Process the webhook event
    const event = payload;
    
    if (event.event === 'charge.success') {
      return {
        success: true,
        event: 'payment_success',
        data: event.data
      };
    } else if (event.event === 'charge.failed') {
      return {
        success: true,
        event: 'payment_failed',
        data: event.data
      };
    }

    return {
      success: true,
      event: 'unknown',
      data: event.data
    };
  } catch (error) {
    console.error('Webhook handling error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  initializePayment,
  verifyPayment,
  createCustomer,
  getCustomer,
  generateReference,
  handleWebhook
};
