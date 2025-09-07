import express from 'express';
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders
} from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Create order and initialize payment
router.post('/', authenticate, createOrder);

// Verify payment (called by frontend after payment)
router.get('/verify/:reference', verifyPayment);

// Handle Paystack webhook (called by Paystack)
router.post('/webhook', handleWebhook);

// Get user orders
router.get('/my-orders', authenticate, getUserOrders);

// Get all orders (admin)
router.get('/all', authenticate, getAllOrders);

// Get single order
router.get('/:id', authenticate, getOrder);

// Update order status
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;