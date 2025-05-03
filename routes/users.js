import express from "express";
import {
  deleteUser,
  getAllUsers,
  getPaymentRequestedUsers,
  getTotalUser,
  getUser,
  totalNumbersOfAdmin,
  totalWithdrawalRequest,
  updateUser,
} from "../controller/user.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router(); // Create a new router
// router.get("/checkauthentications", verifyToken, (req, res, next)=>{
//     res.send("You are authenticated")
// })

// router.get("/checkuser/:id", verifyUser, (req, res, next)=>{
//     res.send("Hello user, you are authenticated and now you can delete your account")
// })

// router.get("/checkadmin/:id", verifyAdmin, (req, res, next)=>{
//     res.send("Hello admin, you are authenticated and now you can delete any account")
// })

router.get("/payment-requested-users", getPaymentRequestedUsers);
router.get("/totalUsers", getTotalUser);
router.get("/totalWithdrawal-Requested", totalWithdrawalRequest);
router.get("/totalAdmins", totalNumbersOfAdmin);
// Update
router.put("/:id", updateUser);
// Delete
router.delete("/:id", deleteUser);
// Get
router.get("/:id", getUser);
// Get All
router.get("/", getAllUsers);

export default router;
