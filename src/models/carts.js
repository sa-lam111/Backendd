
import mongoose, { Schema, model } from "mongoose";

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    }
  ],
}, { timestamps: true });

const Cart = model("Cart", cartSchema);
export default Cart;
