import Order from '../models/order.js';
import Product from '../models/products.js';
import User from '../models/user.model.js';
import { sendEmail } from '../services/email.service.js';
import { 
  initializePayment, 
  verifyPayment, 
  generateReference,
  handleWebhook
} from '../services/paystack.service.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user?.id; // Assuming you have auth middleware

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // Calculate total price
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`
        });
      }

      totalPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity
      });
    }

    // Generate payment reference
    const paymentReference = generateReference();

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalPrice,
      shippingAddress,
      status: 'Pending',
      payment: {
        reference: paymentReference,
        amount: totalPrice
      }
    });

    await order.save();

    // Get user for email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize Paystack payment
    const paymentResult = await initializePayment(
      user.email,
      totalPrice,
      paymentReference,
      {
        orderId: order._id.toString(),
        userId: userId
      }
    );

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize payment',
        error: paymentResult.error
      });
    }

    // Update order with payment URL
    order.payment.authorizationUrl = paymentResult.data.authorization_url;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created and payment initialized',
      data: {
        order: order,
        payment: {
          authorization_url: paymentResult.data.authorization_url,
          access_code: paymentResult.data.access_code,
          reference: paymentReference
        }
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate('items.product')
      .populate('user');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.product').populate('user');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Send status update email
    if (order.user && order.user.email) {
      await sendEmail(
        order.user.email,
        'Order Status Update',
        `Your order #${order._id} status has been updated to ${status}.`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Order Status Update</h2>
            <p>Hello ${order.user.name},</p>
            <p>Your order #${order._id} status has been updated to <strong>${status}</strong>.</p>
            <p>Thank you for your patience!</p>
          </div>
        `
      );
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify payment - Backend endpoint for payment verification
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Find order by payment reference
    const order = await Order.findOne({ 'payment.reference': reference });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify payment with Paystack
    const verificationResult = await verifyPayment(reference);

    if (!verificationResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: verificationResult.error
      });
    }

    const paymentData = verificationResult.data;

    // Update order based on payment status
    if (paymentData.status === 'success') {
      // Update order status
      order.status = 'Paid';
      order.payment.status = 'Success';
      order.payment.paystackReference = paymentData.reference;
      order.payment.paidAt = new Date();

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }

      await order.save();

      // Send confirmation email
      const user = await User.findById(order.user);
      if (user) {
        await sendEmail(
          user.email,
          'Payment Confirmation',
          `Your payment for order #${order._id} has been confirmed.`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Payment Confirmation</h2>
              <p>Hello ${user.name},</p>
              <p>Your payment for order #${order._id} has been confirmed.</p>
              <p><strong>Total Amount:</strong> ₦${order.totalPrice}</p>
              <p><strong>Payment Reference:</strong> ${reference}</p>
              <p>Thank you for your purchase!</p>
            </div>
          `
        );
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order: order,
          payment: paymentData
        }
      });
    } else {
      // Payment failed
      order.payment.status = 'Failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed',
        data: {
          order: order,
          payment: paymentData
        }
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Handle Paystack webhook - Backend processes payment notifications
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const payload = req.body;

    // Process webhook
    const result = await handleWebhook(payload, signature);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Handle different webhook events
    if (result.event === 'payment_success') {
      const { reference } = result.data;
      
      // Find and update order
      const order = await Order.findOne({ 'payment.reference': reference });
      if (order && order.payment.status !== 'Success') {
        order.status = 'Paid';
        order.payment.status = 'Success';
        order.payment.paystackReference = result.data.reference;
        order.payment.paidAt = new Date();
        await order.save();

        // Update stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .populate('user')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};