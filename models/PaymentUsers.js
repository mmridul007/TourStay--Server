import mongoose from "mongoose";
import { Schema } from "mongoose";

const PaymentUsersSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  withdrawMethod: {
    type: String,
    required: true,
  },
  withdrawAmount: {
    type: Number,
    required: true,
  },
  withdrawDate: {
    type: Date,
    default: Date.now,
  },
  withdrawalNumber: {
    type: String,
    required: true,
  },

  withdrawalStatus: {
    type: String,
    default: "pending",
  },
  
});

export default mongoose.model("PaymentUsers", PaymentUsersSchema);
