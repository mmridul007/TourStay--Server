import QuickRooms from "../models/QuickRooms.js";
import mongoose from "mongoose";

export const createQuickRoom = async (req, res, next) => {
  const newQuickRoom = new QuickRooms(req.body);
  try {
    const savedQuickRoom = await newQuickRoom.save();
    res.status(200).json(savedQuickRoom);
  } catch (err) {
    next(err);
  }
};

export const updateQuickRoom = async (req, res, next) => {
  try {
    const updateQuickRoom = await QuickRooms.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updateQuickRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(updateQuickRoom);
  } catch (err) {
    next(err);
  }
};

export const deleteQuickRoom = async (req, res, next) => {
  try {
    const deleteQuickRoom = await QuickRooms.findByIdAndDelete(req.params.id);
    if (!deleteQuickRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json("Room has been deleted Successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuickRooms = async (req, res, next) => {
  try {
    const quickRooms = await QuickRooms.find();
    res.status(200).json(quickRooms);
  } catch (err) {
    next(err);
  }
};

export const getQuickRoomById = async (req, res, next) => {
  try {
    // Check if ID is valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid room ID format" });
    }

    const quickRoom = await QuickRooms.findById(req.params.id);
    if (!quickRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(quickRoom);
  } catch (err) {
    next(err);
  }
};

export const getQuickRoomByUserId = async (req, res, next) => {
  try {
    const quickRooms = await QuickRooms.find({ userID: req.params.userID });
    res.status(200).json(quickRooms);
  } catch (err) {
    next(err);
  }
};

export const getQuickRoomByCity = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    // Case-insensitive search for the city
    const quickRooms = await QuickRooms.find({
      city: { $regex: new RegExp(city, "i") },
      isAvailableForRent: true,
    });

    if (quickRooms.length === 0) {
      return res.status(404).json({
        message: `No rooms found in ${city}. Try another location.`,
      });
    }

    res.status(200).json(quickRooms);
  } catch (err) {
    next(err);
  }
};

export const totalQuickRoomCount = async (req, res, next) => {
  try {
    const totalCount = await QuickRooms.countDocuments();
    res.status(200).json(totalCount);
  } catch (err) {
    next(err);
  }
};

export const searchQuickroomsForChatBot = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required." });
    }

    const quickrooms = await QuickRooms.find({
      city: { $regex: new RegExp(city, "i") },
      isAvailableForRent: true,
    });

    res.status(200).json(quickrooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
