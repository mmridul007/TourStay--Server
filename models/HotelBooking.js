// models/HotelBooking.js
import mongoose from "mongoose";
import { Schema } from "mongoose";

const HotelBookingSchema = new Schema({
  hotelId: {
    type: Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  totalNights: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  numberOfRooms: {
    type: Number,
    required: true,
    default: 1,
  },
  adults: {
    type: Number,
    required: true,
    default: 1,
  },
  children: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    default: "",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  isPromoApplied: {
    type: Boolean,
    default: false,
  },
  promoCode: {
    type: String,
    default: "",
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundStatus: {
    type: String,
    enum: ["pending", "processing", "refunded", "rejected"],
    default: "pending",
  },
  refundDate: {
    type: Date,
  },
  roomNumbers:{
    type: [Number],
  },
  bookingType: {
    type: String,
    default: "Hotel",
  },
  paymentType:{
    type: String,
  }
}, { timestamps: true });

export default mongoose.model("HotelBooking", HotelBookingSchema);