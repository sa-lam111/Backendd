import dotenv from 'dotenv';
dotenv.config();
// import express from 'express'
// import userRoutes from './routes/user.routes.js'

// const app = express()

// app.use(express.json())

// app.use('/api/users', userRoutes)

// const PORT = process.env.PORT || 3001
// app.listen(PORT, () => {
//     console.log(`Server running on PORT ${PORT}`)
// })
 


import express, { json } from "express";
import { connect } from "mongoose";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();
app.use(json()); 





connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));



app.use("/users", userRoutes);
app.use("/products", productRoutes);


if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
}

export default app;
 