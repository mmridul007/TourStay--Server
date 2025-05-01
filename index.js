import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import hotelRoutes from "./routes/hotels.js";
import roomRoutes from "./routes/rooms.js";
import quickRoomRoutes from "./routes/quickRoom.js";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import cloudinaryRoutes from "./routes/cloudinary.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import hotelPaymentRoutes from "./routes/hotelPaymentRoutes.js";
import roomReviewRoutes from "./routes/roomReview.js";
import cors from "cors";
import paymentSuccessb from "./routes/paymentUsers.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (error) {
    handleError(error);
    console.log("Error connecting to database");
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to db");
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection is disconnected");
});

// Middleware
app.use(
  cors({
    origin: ["https://tourstay.netlify.app", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/quickrooms", quickRoomRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/cloudinary", cloudinaryRoutes);
app.use("/api/roomReview", roomReviewRoutes);
app.use("/api/hotel-payment", hotelPaymentRoutes);
app.use("/api/paymentUsers", paymentSuccessb);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  connection();
  console.log("Server is running on port 4000");
});
