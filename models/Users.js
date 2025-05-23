import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      default:
        "https://wallpapers.com/images/hd/anonymous-profile-silhouette-b714qekh29tu1anb.jpg",
    },
    city: {
      type: String,
    },
    country: {
      type: String,
      default: "Bangladesh",
      immutable: true, // This makes the field unchangeable after creation
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalWithdraw: {
      type: Number,
      default: 0,
    },
    withdrawHistory: [
      {
        amount: { type: Number, default: 0 },
        withdrawStatus: { type: String, default: "pending" },
        date: { type: Date, default: Date.now },
      },
    ],
    withdrawMethod: {
      type: String,
      default: "",
    },
    withdrawalNumber: {
      type: String,
      default: "",
    },
    withdrawalStatus: {
      type: String,
      default: "",
    },
    withdrawalHoldAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
