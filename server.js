import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
dotenv.config();
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from"./routes/cartRoutes.js";
import orderRoutes from"./routes/orderRoutes.js";
const app=express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use('/api/v1/user', userRoutes)
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/cart',cartRoutes)
app.use('/api/v1/order',orderRoutes);
app.use(async (req, res, next) => {
  await connectDB();
  next();
});
// const Port =process.env.PORT;
// app.listen(3000 ,()=>{
//     connectDB()
//     console.log(`Server is running on port 3000`);
// })
export default app;








































