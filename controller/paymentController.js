import Booking from "../models/Booking.js";
import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
import _ from "lodash";
import QuickRooms from "../models/QuickRooms.js";
import Users from "../models/Users.js";
dotenv.config();

const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
// SSLCommerz Configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = false; // true for live, false for sandbox

// Initialize SSLCommerz payment
export const initPayment = async (req, res) => {
  try {
    // console.log("Payment initiation request received:", {
    //   body: req.body,
    //   headers: req.headers,
    // });

    // console.log("Using SSLCommerz credentials:", {
    //   store_id: store_id ? "configured" : "MISSING",
    //   store_passwd: store_passwd ? "configured" : "MISSING",
    // });
    // Validate environment variables
    if (!store_id || !store_passwd) {
      console.error("SSLCommerz credentials missing!");
      return res.status(500).json({
        status: "FAILED",
        message: "Payment gateway not configured",
      });
    }

    const { booking, total_amount, cus_name, cus_phone } = req.body;

    // Validate required fields
    if (!booking || !total_amount || !cus_name || !cus_phone) {
      console.error("Missing required fields:", {
        booking: !!booking,
        total_amount: !!total_amount,
        cus_name: !!cus_name,
        cus_phone: !!cus_phone,
      });
      return res.status(400).json({
        status: "FAILED",
        message: "Missing required fields",
      });
    }

    // Validate amount
    const amount = parseFloat(total_amount);
    // console.log(typeof amount);
    if (isNaN(amount)) {
      return res.status(400).json({
        status: "FAILED",
        message: "Invalid payment amount",
      });
    }
    // Create booking
    const newBooking = await Booking.create({
      ...booking,
      customerName: cus_name,
      customerEmail: req.body.cus_email || "customer@example.com",
      customerPhone: cus_phone,
      transactionId: new Date().getTime(),
      paymentStatus: "pending",
      status: "pending",
    });

    const tran_id = newBooking._id.toString();
    // console.log("Creating booking with _id:", newBooking._id);
    // console.log('Booking created:', newBooking);

    // Initialize SSLCommerz payment
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const paymentData = {
      total_amount: amount.toFixed(2),
      currency: "BDT",
      tran_id: tran_id,
      success_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/success/${tran_id}?tran_id=${tran_id}`,
      fail_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/fail/${tran_id}?tran_id=${tran_id}`,
      cancel_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/cancel/${tran_id}?tran_id=${tran_id}`,
      ipn_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/ipn/${tran_id}?tran_id=${tran_id}`,
      shipping_method: "NO",
      product_name: req.body.product_name || "Room Booking",
      product_category: req.body.product_category || "Accommodation",
      product_profile: req.body.product_profile || "General",
      cus_name,
      cus_email: req.body.cus_email || "customer@example.com",
      cus_phone,
      cus_add1: booking.address || "N/A",
      cus_city: booking.city || "N/A",
      cus_country: "Bangladesh",
      ship_name: cus_name,
      ship_add1: booking.address || "N/A",
      ship_city: booking.city || "N/A",
      ship_country: "Bangladesh",
    };

    // console.log(process.env.BACKEND_URL);
    // console.log('Sending to SSLCommerz:', paymentData);

    const apiResponse = await sslcz.init(paymentData);
    // console.log("SSLCommerz response:", apiResponse);

    if (!apiResponse?.GatewayPageURL) {
      await Booking.findByIdAndDelete(newBooking._id);
      return res.status(400).json({
        status: "FAILED",
        message: "Payment gateway returned no URL",
        response: apiResponse,
      });
    }

    return res.json({
      status: "SUCCESS",
      GatewayPageURL: apiResponse.GatewayPageURL,
    });
  } catch (error) {
    console.error("Full payment error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    return res.status(500).json({
      status: "FAILED",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Payment initialization failed",
    });
  }
};

// Payment success handler
export const paymentSuccess = async (req, res) => {
  try {
    const { tran_id } = req.params;
    // console.log("Payment success callback received for:", tran_id);

    const val_id = req.body.val_id || req.query.val_id || req.params.val_id;

    if (!val_id) {
      // Log all received data for debugging
      // console.error("Validation ID missing in callback. Full request:", {
      //   body: req.body,
      //   query: req.query,
      //   params: req.params,
      // });
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?message=Payment validation data missing`
      );
    }

    // First validate the payment with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({
      val_id: req.body.val_id || req.query.val_id,
    });

    if (validation.status !== "VALID") {
      // console.error("Payment validation failed:", validation);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?message=Payment validation failed`
      );
    }

    // Update the booking status
    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: tran_id },
      {
        paymentStatus: "completed",
        status: "confirmed",
        paymentDetails: validation,
      },
      { new: true }
    );

    if (!updatedBooking) {
      // console.error("Booking not found for transaction:", tran_id);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?message=Booking not found`
      );
    }

    // Update room unavailable dates
    const dates = getDatesBetween(
      new Date(updatedBooking.checkIn),
      new Date(updatedBooking.checkOut)
    );
    // console.log(dates)
    // console.log(updatedBooking)
    await Users.findByIdAndUpdate(updatedBooking.ownerId, {
      $inc: { balance: updatedBooking.totalPrice - 30 },
    });

    await QuickRooms.findByIdAndUpdate(updatedBooking.roomId, {
      $addToSet: { unavailableDates: { $each: dates } },
    });

    // console.log("Payment success callback for tran_id:", tran_id);
    // console.log("Payment successfully processed for:", tran_id);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-success?tran_id=${tran_id}`
    );
  } catch (error) {
    // console.error("Payment success processing error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?message=Server error`
    );
  }
};

export const paymentFail = async (req, res) => {
  try {
    const { tran_id } = req.params;

    // Update booking status to failed
    await Booking.findOneAndUpdate(
      { transactionId: tran_id },
      { paymentStatus: "failed" }
    );

    // Redirect to failure page
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?tran_id=${tran_id}`
    );
  } catch (error) {
    console.error("Payment fail handling error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?message=Server error`
    );
  }
};

// Payment cancel handler
export const paymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.params;

    // Update booking status to "cancelled"
    const updatedBooking = await Booking.findOneAndUpdate(
      { transactionId: tran_id },
      { $set: { status: "cancelled" } },
      { new: true } // Return the updated document
    );

    // console.log(updatedBooking)

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Redirect to cancel confirmation page
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-cancelled?tran_id=${tran_id}`
    );
  } catch (error) {
    console.error("Payment cancel handling error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?message=Server error`
    );
  }
};

// IPN (Instant Payment Notification) handler
export const ipn = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const { status } = req.body;

    if (status === "VALID") {
      await Booking.findOneAndUpdate(
        { transactionId: tran_id },
        { paymentStatus: "completed", status: "confirmed" }
      );
    } else if (status === "FAILED") {
      await Booking.findOneAndUpdate(
        { transactionId: tran_id },
        { paymentStatus: "failed" }
      );
    }

    return res.status(200).json({ status: "SUCCESS" });
  } catch (error) {
    console.error("IPN handling error:", error);
    return res.status(500).json({ status: "FAILED", message: error.message });
  }
};

// export const verify = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.tran_id);

//     if (!booking) {
//       return res.status(404).json({ status: "not_found" });
//     }

//     res.json({
//       status: booking.paymentStatus,
//       booking: _.pick(booking, ["roomId", "checkIn", "checkOut", "totalPrice"]),
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const verify = async (req, res) => {
  try {
    // console.log("Verifying transaction:", req.params.tran_id);
    // console.log("VERIFY API HIT");

    const booking = await Booking.findById(req.params.tran_id);

    // console.log("Verifying payment for tran_id:", req.params.tran_id);

    if (!booking) {
      console.error("Booking not found for ID:", req.params.tran_id);
      return res.status(404).json({ status: "not_found" });
    }

    res.json({
      status: booking.paymentStatus,
      booking: _.pick(booking, [
        "roomId",
        "checkIn",
        "checkOut",
        "totalPrice",
        "transactionId",
      ]),
    });
  } catch (error) {
    console.error("Verify route error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    const bookings = await Booking.find({ customerId });

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

// export const cancelBooking = async (req, res, next) => {
//   try {
//     const { id } = req.params; // changed from _id to id

//     if (!id) {
//       return res.status(400).json({ message: "bookingId is required" });
//     }

//     const booking = await Booking.findByIdAndUpdate(
//       id,
//       { status: "cancelled" },
//       { new: true }
//     );

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     res.status(200).json(booking);
//   } catch (err) {
//     next(err);
//   }
// };
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundStatus, paymentStatus } = req.body;

    const updateData = {
      status: "cancelled",
      updatedAt: new Date(),
    };

    // If refund information is provided, add it to the update
    if (refundAmount !== undefined && refundStatus) {
      updateData.refundAmount = refundAmount;
      updateData.refundStatus = refundStatus;

      // Update payment status if refund is being processed
      if (refundStatus === "refunded") {
        updateData.paymentStatus = "refunded";
        updateData.refundDate = new Date();
      } else if (refundStatus === "processing") {
        updateData.paymentStatus = "refunded";
      } else if (refundStatus === "rejected") {
        updateData.paymentStatus = "cancelled";
      }
    }

    // If paymentStatus is explicitly provided, use it
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // console.log(booking)
    const reduceAmount = booking.totalPrice - 30;
    await Users.findByIdAndUpdate(booking.ownerId, {
      $inc: { balance: -reduceAmount },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const getOwnerBooking = async (req, res, next) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    const bookings = await Booking.find({ ownerId });

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const getAllRufundList = async (req, res, next) => {
  try {
    const refundBookings = await Booking.find({
      refundStatus: "refunded",
    });

    if (!refundBookings) {
      return res.status(404).json({ message: "There are no refund bookings" });
    }
    res.status(200).json(refundBookings);
  } catch (err) {
    next(err);
  }
};

export const totalSuccessfulBooking = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments({
      paymentStatus: "completed",
    });

    res.status(200).json(totalBookings);
  } catch (err) {
    next(err);
  }
};

export const totalRefundedBooking = async (req, res, next) => {
  try {
    const totalRefunded = await Booking.countDocuments({
      paymentStatus: "refunded",
    });

    res.status(200).json(totalRefunded);
  } catch (err) {
    next(err);
  }
};
export const totalCancelledBooking = async (req, res, next) => {
  try {
    const totalCancelled = await Booking.countDocuments({
      status: "cancelled",
      refundAmount: { $eq: 0 },
    });

    res.status(200).json(totalCancelled);
  } catch (err) {
    next(err);
  }
};

export const totalAmountOfSuccessfulBooking = async (req, res, next) => {
  try {
    const totalAmount = await Booking.aggregate([
      {
        $match: { paymentStatus: "completed" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.status(200).json(totalAmount[0].totalAmount);
  } catch (err) {
    next(err);
  }
};

export const totalAmountOfRefundedBooking = async (req, res, next) => {
  try {
    const totalAmount = await Booking.aggregate([
      {
        $match: { paymentStatus: "refunded" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$refundAmount" },
        },
      },
    ]);

    res.status(200).json(totalAmount[0].totalAmount);
  } catch (err) {
    next(err);
  }
};

export const totalBookingPriceOfRefundedBooking = async (req, res, next) => {
  try {
    const totalAmount = await Booking.aggregate([
      {
        $match: { paymentStatus: "refunded" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.status(200).json(totalAmount[0].totalAmount);
  } catch (err) {
    next(err);
  }
};
