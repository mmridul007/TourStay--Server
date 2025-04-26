// import mongoose from "mongoose";
// import {Schema} from "mongoose";

// const RoomSchema = new Schema({
//     title:{
//         type: String,
//         required: true,
//     },
//     price:{
//         type: Number,
//         required: true,
//     },
//     maxPeople:{
//         type: Number,
//         required: true,
//     },
//     desc:{
//         type: String,
//         required: true,
//     },
//     roomNumbers:[{number:Number, unavailableDates:{type: [Date]}}],
    

// }, {timestamps: true});

// export default mongoose.model("Room", RoomSchema);

import mongoose from "mongoose";

const roomNumberSchema = new mongoose.Schema({
  number: Number,
  unavailableDates: { type: [Date] },
});

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: Number,
  maxPeople: Number,
  desc: String,
  roomNumbers: [roomNumberSchema],
});

export default mongoose.model("Room", roomSchema);
