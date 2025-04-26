import express from "express";
import { createPaymentSuccess, getAllPayments } from "../controller/payementUsers.js";

const router = express.Router();

router.post('/', createPaymentSuccess);
router.get('/allPayments', getAllPayments);

export default router;