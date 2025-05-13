import express from "express";
import {
  countByCity,
  countByType,
  createHotel,
  deleteHotel,
  featuredHotels,
  getAllHotels,
  getHotel,
  getHotelByCity,
  getHotelRooms,
  searchHotelsForChatBot,
  totalHotelCount,
  updateHotel,
} from "../controller/hotel.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router(); // Create a new router

// Create
router.post("/", createHotel);
// Update
router.put("/:id", updateHotel);
// Delete
router.delete("/:id", deleteHotel);

// Get
router.get("/find/:id", getHotel);
router.get("/totalHotels", totalHotelCount);
// Get All
router.get("/", getAllHotels);
router.get("/countByCity", countByCity);
router.get("/byCity/:city", getHotelByCity)
router.get("/countByType", countByType);
router.get("/featuredHotel", featuredHotels);
router.get("/room/:id", getHotelRooms);
router.get("/search", searchHotelsForChatBot);

export default router;
