// import mongoose from "mongoose";
// import {Schema} from "mongoose";

// const HotelSchema = new Schema({
//     name:{
//         type: String,
//         required: true,
//     },
//     type:{
//         type: String,
//         required: true,
//     },
//     city:{
//         type: String,
//         required: true,
//     },
//     address:{
//         type: String,
//         required: true,
//     },
//     distance:{
//         type: String,
//         required: true,
//     },
//     photos:{
//         type: [String]
//     },
//     title:{
//         type: String,
//         required: true,
//     },
//     desc:{
//         type: String,
//         required: true,
//     },
//     rating:{
//         type: Number,
//         min:0,
//         max:5,
//     },
//     rooms:{
//         type: [String],
//     },
//     cheapestPrice:{
//         type: Number,
//         required: true,
//     },
//     featured:{
//         type: Boolean,
//         default: false,
//     },
//     bookingType:{
//         type: String,
//         default: "Hotels",
//     },
//     product_category:{
//         type: String,
//         default: "Hotel",
//     }

// });

// export default mongoose.model("Hotel", HotelSchema);

import mongoose from "mongoose";
import { Schema } from "mongoose";

const HotelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Hotel", "Apartment", "Resort", "Villa", "Cabin"], // Example types
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    mapLocation:{
        type: String,
        required: true,
    },
    distance: {
      type: String,
      required: true,
    },
    photos: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"], // Limit number of photos
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    amenities: {
      // Added amenities
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        // Added reviews
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now },
      },
    ],
    rooms: {
      type: [String], // References to room IDs
      default: [],
    },
    cheapestPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    policies: {
      // Added hotel policies
      checkIn: String,
      checkOut: String,
      cancellation: String,
      paymentOptions: [String],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    contact: {
      // Added contact information
      email: String,
      phone: String,
      website: String,
    },
    bookingType: {
      type: String,
      default: "Hotels",
    },
    product_category: {
      type: String,
      default: "Hotel",
    },
    status: {
      // Added status for management
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Validate array limit for photos
function arrayLimit(val) {
  return val.length <= 6;
}

export default mongoose.model("Hotel", HotelSchema);
