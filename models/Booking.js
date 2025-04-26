import mongoose from "mongoose";
import { Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    customerId: {
      type: String,
    },
    ownerId: {
      type: String,
    },
    hotelId: {
      type: String,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: false,
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
    isPromoApplied: {
      type: Boolean,
      default: false,
    },
    promoCode: {
      type: String,
      default: "",
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
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "completed"],
      default: "pending", // Change default to pending
    },
    bookingType: {
      type: String,
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
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
