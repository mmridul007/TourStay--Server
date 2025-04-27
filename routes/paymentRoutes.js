import express from "express";

const router = express.Router();
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  ipn,
  verify,
  getBooking,
  cancelBooking,
  getAllBookings,
  getOwnerBooking,
  getAllRufundList,
  totalSuccessfulBooking,
  totalRefundedBooking,
  totalCancelledBooking,
  totalAmountOfSuccessfulBooking,
  totalAmountOfRefundedBooking,
  totalBookingPriceOfRefundedBooking,
  refundBooking,
} from "../controller/paymentController.js";
// Initialize SSLCommerz payment
router.post("/sslcommerz/init", initPayment);

// SSLCommerz callback routes
router.post(
  "/sslcommerz/success/:tran_id",
  express.urlencoded({ extended: true }),
  paymentSuccess
);
router.post("/sslcommerz/fail/:tran_id", paymentFail);
router.post("/sslcommerz/cancel/:tran_id", paymentCancel);
router.post("/sslcommerz/ipn/:tran_id", ipn);

// For GET requests that SSLCommerz might send
router.get("/sslcommerz/success/:tran_id", paymentSuccess);
router.get("/sslcommerz/fail/:tran_id", paymentFail);
router.get("/sslcommerz/cancel/:tran_id", paymentCancel);
router.get("/verify/:tran_id", verify);
router.get('/orderFor/:customerId', getBooking)
router.get('/orderForOwner/:ownerId', getOwnerBooking)
router.put('/cancelOrder/:id', cancelBooking)
router.put('/refundOrder/:id', refundBooking)
router.get('/orders', getAllBookings)
router.get('/allRefunds', getAllRufundList)
router.get('/totalSuccessfulOrders', totalSuccessfulBooking)
router.get('/totalRefundedOrders', totalRefundedBooking)
router.get('/totalCancelledOrders', totalCancelledBooking)
router.get('/totalAmountOfSuccessfulOrders', totalAmountOfSuccessfulBooking)
router.get('/totalAmountOfRefundedOrders', totalAmountOfRefundedBooking)
router.get('/totalBookingPriceOfRefundedBooking', totalBookingPriceOfRefundedBooking)
export default router;
