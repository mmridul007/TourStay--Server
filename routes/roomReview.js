import express from "express";
import {
  createRoomReview,
  deleteRoomReview,
  getReviewByUserAndRoom,
  getRoomReviewbyId,
  getRoomReviewbyUserId,
  updateRoomReview,
} from "../controller/roomReview.js";

const router = express.Router();

router.post("/", createRoomReview);
router.get("/findForRoom/:roomId", getRoomReviewbyId);
router.get("/findForUser/:userId", getRoomReviewbyUserId);
router.get("/findForUserAndRoom/:userId/:roomId", getReviewByUserAndRoom);

router.delete("/:id", deleteRoomReview);
router.put("/:id", updateRoomReview);

export default router;
