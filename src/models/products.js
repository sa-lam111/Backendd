
import mongoose, { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: false },
  stock: { type: Number, default: 0 },
  image: String,
}, { timestamps: true });

const Product = model("Product", productSchema);
export default Product;
