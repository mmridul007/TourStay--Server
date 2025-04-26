import Room from "../models/Rooms.js";
import Hotel from "../models/Hotels.js";
import { createError } from "../utils/error.js";
import Rooms from "../models/Rooms.js";

// Create Room
export const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  const newRoom = new Room(req.body);

  try {
    const savedRoom = await newRoom.save();
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom._id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

// Update Room
export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

export const updateRoomAvailability = async (req, res, next) => {
  try {
    await Rooms.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $push: {
          "roomNumbers.$.unavailableDates": req.body.dates,
        },
      }
    );
    res.status(200).json("Room availavility has been updated")
  } catch (err) {
    next(err);
  }
};

// Delete room
export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;

  try {
    await Hotel.findByIdAndUpdate(hotelId, {
      $pull: { rooms: req.params.id },
    });
  } catch (err) {
    next(err);
  }

  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json("Room has been deleted");
  } catch (err) {
    next(err);
  }
};

// Get Room
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};

// Get rooms
export const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    if (!rooms) {
      return res.status(404).json({ message: "There are no rooms" });
    }
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};
