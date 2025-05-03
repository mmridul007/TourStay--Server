import express from "express";
import { verifyAdmin } from "../utils/verifyToken.js";
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoom,
  updateRoom,
  updateRoomAvailability,
} from "../controller/room.js";

const router = express.Router(); // Create a new router
// Create
router.post("/:hotelid", createRoom);
// Update
router.put("/:id", updateRoom);
router.put("/availability/:id", updateRoomAvailability);
// Delete
router.delete("/:id/:hotelid",  deleteRoom);
// Get
router.get("/:id", getRoom);
// Get All
router.get("/", getAllRooms);

export default router;
