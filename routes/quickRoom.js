import express from "express";
import {
  createQuickRoom,
  deleteQuickRoom,
  getQuickRoomByCity,
  getQuickRoomById,
  getQuickRoomByUserId,
  getQuickRooms,
  totalQuickRoomCount,
  updateQuickRoom,
} from "../controller/quickRoom.js";

const router = express.Router();

router.post("/", createQuickRoom);

router.get("/", getQuickRooms);
router.get("/find/:id", getQuickRoomById);
router.put("/:id", updateQuickRoom);
router.delete("/:id", deleteQuickRoom);
router.get("/userID/:userID", getQuickRoomByUserId);
router.get("/search/city", getQuickRoomByCity);
router.get('/totalQuickrooms', totalQuickRoomCount)

export default router;
