import RoomReview from "../models/RoomReview.js";

export const createRoomReview = async (req, res, next) => {
  try {
    const newReview = new RoomReview(req.body); // FIXED
    const savedReview = await newReview.save();
    res.status(200).json(savedReview);
  } catch (err) {
    next(err);
  }
};

export const getRoomReviewbyId = async (req, res, next) => {
  const roomId = req.params.roomId;
  try {
    const roomReview = await RoomReview.find({ roomId });
    res.status(200).json(roomReview);
  } catch (err) {
    next(err);
  }
};

export const getRoomReviewbyUserId = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const roomReview = await RoomReview.find({ userId });
    res.status(200).json(roomReview);
  } catch (err) {
    next(err);
  }
};

export const deleteRoomReview = async (req, res, next) => {
  const reviewId = req.params.id;
  try {
    await RoomReview.findByIdAndDelete(reviewId);
    res.status(200).json("Review has been deleted.");
  } catch (err) {
    next(err);
  }
};

export const updateRoomReview = async (req, res, next) => {
  const reviewId = req.params.id;
  try {
    const updatedReview = await RoomReview.findByIdAndUpdate(
      reviewId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedReview);
  } catch (err) {
    next(err);
  }
};

export const getReviewByUserAndRoom = async (req, res, next) => {
  const { userId, roomId } = req.params;
  try {
    const review = await RoomReview.findOne({ userId, roomId });
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};
