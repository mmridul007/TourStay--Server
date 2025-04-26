import mongoose from "mongoose";
import { Schema } from "mongoose";

const QuickRoomSchema = new Schema({
    title:{
        type : String,
        required: true,
    },
    desc:{
        type : String,
        required: true,
    },
    cheapestPrice:{
        type: Number,
        required: true,
    },
    roomType:{
        type : String,
        required: true,
    },
    photos:{
        type: [String]
    },
    mapLocation:{
        type: String,
        required: true,
    },
    userID:{
        type: String,
    },
    address:{
        type: String,
    },
    city:{
        type: String,
        required: true,
    },
    diningRoom:{
        type: Boolean,
    },
    kitchen:{
        type: Boolean,
    },
    refrigerator:{
        type: Boolean,
    },
    oven:{
        type: Boolean,
    },
    isSmokingAllowed:{
        type: Boolean,
        required: true,
    },
    messageOfSmoking:{
        type: String,
    },
    isPetAllowed:{
        type: Boolean,
        required: true,
    },
    messageOfPet:{
        type: String,
    },
    isWifiAvailable:{
        type: Boolean,
        required: true,
    },
    isParkingAvailable:{
        type: Boolean,
        required: true,
    },
    whichPeopleAreAllowed:{
        type: String,
    },
    whichTypeOfPeopleAreNotAllowed:{
        type: [String],
    },
    totalGusts:{
        type: Number,
    },
    totalRooms:{
        type: Number,
    },
    totalBedrooms:{
        type: Number,
    },
    totalBeds:{
        type: Number,
    },
    totalBathrooms:{
        type: Number,
    },
    bathRoomType:{
        type: String,
    },
    requiredDocuments:{
        type: [String],
    },
    electricityTime:{
        type: String,
    },
    waterTime:{
        type: String,
    },
    isGasAvailable:{
        type: Boolean,
    },
    maxPeople:{
        type: Number,
    },
    unavailableDates: {
      type: [String],
    },
    isAvailableForRent:{
        type: Boolean,
    },
    bookingType:{
        type: String,
        default: "QuickRooms",
    },
    product_category:{
        type: String,
        default: "QuickRoom",
    }

},{timestamps: true})

export default mongoose.model("QuickRoom", QuickRoomSchema);
