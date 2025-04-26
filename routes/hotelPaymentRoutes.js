// routes/hotelPaymentRoutes.js
import express from "express";
import {
  
  hotelPaymentSuccess,
  hotelPaymentFail,
  hotelPaymentCancel,
  hotelPaymentIPN,
  verifyHotelBooking,
  getCustomerHotelBookings,
  cancelHotelBooking,
  initHotelPayment,
  getAllBookings,
  totalSuccessfulBookings,
  totalRefundedBookings,
  totalCancelledBookings,
  totalAmountOfSuccessfulBookings,
  totalAmountOfRefundedBookings,
  totalBookingPriceOfRefundedBookings,
} from "../controller/hotelPaymentController.js";
import { totalCancelledBooking, totalRefundedBooking, totalSuccessfulBooking } from "../controller/paymentController.js";

const router = express.Router();

// Initialize payment
router.post("/init", initHotelPayment);

// Payment callbacks
router.post("/success/:tran_id", hotelPaymentSuccess);
router.post("/fail/:tran_id", hotelPaymentFail);
router.post("/cancel/:tran_id", hotelPaymentCancel);
router.post("/ipn/:tran_id", hotelPaymentIPN);

// For GET requests that SSLCommerz might send
router.get("/success/:tran_id", hotelPaymentSuccess);
router.get("/fail/:tran_id", hotelPaymentFail);
router.get("/cancel/:tran_id", hotelPaymentCancel);

// Booking management
router.get("/verify/:tran_id", verifyHotelBooking);
router.get("/customer/:customerId", getCustomerHotelBookings);
router.put("/cancel/:tran_id", cancelHotelBooking);
router.get("/orders", getAllBookings)

router.get('/totalSuccessfulOrders', totalSuccessfulBookings)
router.get('/totalRefundOrders', totalRefundedBookings)
router.get('/totalCancelOrders', totalCancelledBookings)
router.get('/totalAmountOfSuccessfulBookings', totalAmountOfSuccessfulBookings)
router.get('/totalAmountOfRefundedBookings',totalAmountOfRefundedBookings)
router.get('/totalBookingPriceOfRefundedBookings', totalBookingPriceOfRefundedBookings)

export default router;
