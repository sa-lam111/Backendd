
import mongoose, { Schema, model } from "mongoose";

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
    }
  ],
  totalPrice: Number,
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Paid", "Shipped", "Delivered", "Cancelled"],
    default: "Pending" 
  },
  payment: {
    reference: { type: String, unique: true },
    status: { 
      type: String, 
      enum: ["Pending", "Success", "Failed"],
      default: "Pending" 
    },
    amount: Number,
    currency: { type: String, default: "NGN" },
    paystackReference: String,
    paidAt: Date,
    authorizationUrl: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "Nigeria" }
  }
}, { timestamps: true });

const Order = model("Order", orderSchema);
export default Order;
