
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
  status: { type: String, default: "Pending" },
}, { timestamps: true });

const Order = model("Order", orderSchema);
export default Order;
