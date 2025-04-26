import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
import HotelBooking from "../models/HotelBooking.js";
import _ from "lodash";
import Hotel from "../models/Hotels.js";
import Room from "../models/Rooms.js";
dotenv.config();

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = false;

const getDatesInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const date = new Date(start);
  const dates = [];

  while (date <= end) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

// Function to remove dates from unavailableDates when a booking is cancelled
const removeRoomUnavailability = async (roomNumbers, checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  // Generate all dates between checkIn and checkOut as ISO strings
  const dates = [];
  const date = new Date(start);

  while (date <= end) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  try {
    // Update each room by removing the unavailable dates
    await Promise.all(
      roomNumbers.map(async (roomNumber) => {
        await Room.updateOne(
          { "roomNumbers.number": parseInt(roomNumber) },
          {
            $pull: {
              "roomNumbers.$.unavailableDates": {
                $gte: new Date(checkIn),
                $lte: new Date(checkOut),
              },
            },
          }
        );
      })
    );
    console.log(
      `Successfully removed unavailable dates for rooms: ${roomNumbers.join(
        ", "
      )}`
    );
  } catch (error) {
    console.error("Error removing unavailable dates:", error);
    throw error;
  }
};

// Update unavailable dates in the selected rooms
const updateRoomAvailability = async (roomNumbers, checkIn, checkOut) => {
  const dates = getDatesInRange(checkIn, checkOut);

  await Promise.all(
    roomNumbers.map(async (roomNumber) => {
      await Room.updateOne(
        { "roomNumbers.number": roomNumber },
        {
          $push: {
            "roomNumbers.$.unavailableDates": { $each: dates },
          },
        }
      );
    })
  );
};

// Initialize Hotel Booking Payment
export const initHotelPayment = async (req, res) => {
  try {
    if (!store_id || !store_passwd) {
      return res.status(500).json({
        status: "FAILED",
        message: "Payment gateway not configured",
      });
    }

    const { bookingData } = req.body;

    // console.log("Incoming body:", req.body);
    // console.log(bookingData, customerDetails);

    // if (!bookingData) {
    //   return res.status(400).json({
    //     status: "FAILED",
    //     message: "Missing required fields",
    //   });
    // }

    const requiredFields = [
      "customerName",
      "customerEmail",
      "customerPhone",
      "totalPrice",
      "hotelId",
    ];
    for (let field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({
          status: "FAILED",
          message: `Missing field: ${field}`,
        });
      }
    }

    console.log("Booking Data:", bookingData);

    // Validate hotel exists
    const hotel = await Hotel.findById(bookingData.hotelId);
    if (!hotel) {
      return res.status(404).json({
        status: "FAILED",
        message: "Hotel not found",
      });
    }
    // Create new hotel booking
    const newBooking = await HotelBooking.create({
      ...bookingData,
      customerId: bookingData.customerId,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      transactionId: new Date().getTime(),
      paymentStatus: "pending",
      bookingStatus: "pending",
    });

    const tran_id = newBooking._id.toString();

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const paymentData = {
      total_amount: bookingData.totalPrice.toFixed(2),
      currency: "BDT",
      tran_id: tran_id, // must be unique
      success_url: `${process.env.BACKEND_URL}/api/hotel-payment/success/${tran_id}?tran_id=${tran_id}`,
      fail_url: `${process.env.BACKEND_URL}/api/hotel-payment/fail/${tran_id}?tran_id=${tran_id}`,
      cancel_url: `${process.env.BACKEND_URL}/api/hotel-payment/cancel/${tran_id}?tran_id=${tran_id}`,
      ipn_url: `${process.env.BACKEND_URL}/api/hotel-payment/ipn/${tran_id}?tran_id=${tran_id}`,
      shipping_method: "NO",
      product_name: `Booking at ${hotel.name}`,
      product_category: "Hotel Booking",
      product_profile: "physical-goods",
      cus_name: bookingData.customerName,
      cus_email: bookingData.customerEmail,
      cus_phone: bookingData.customerPhone,
      cus_add1: hotel.address || "N/A",
      cus_city: hotel.city || "Dhaka",
      cus_country: "Bangladesh",
      ship_name: bookingData.customerName,
      ship_add1: hotel.address || "N/A",
      ship_city: hotel.city || "Dhaka",
      ship_country: "Bangladesh",
    };

    // console.log("SSLCommerz credentials:", store_id, store_passwd, is_live);

    const apiResponse = await sslcz.init(paymentData);
    // console.log("SSLCommerz API Response:", apiResponse);
    if (!apiResponse?.GatewayPageURL) {
      await HotelBooking.findByIdAndDelete(newBooking._id);
      return res.status(400).json({
        status: "FAILED",
        message: "Payment gateway returned no URL",
      });
    }

    return res.json({
      status: "SUCCESS",
      GatewayPageURL: apiResponse.GatewayPageURL,
      bookingId: newBooking._id,
    });
  } catch (error) {
    console.error("Hotel payment error:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Hotel payment initialization failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Payment Success Handler
export const hotelPaymentSuccess = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const val_id = req.body?.val_id || req.query?.val_id;

    console.log("val_id:", val_id);

    if (!val_id) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?reason=validation_missing`
      );
    }

    // Step 1: Validate payment with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation.status !== "VALID") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?reason=validation_failed`
      );
    }

    // Step 2: Fetch booking from DB using tran_id
    const booking = await HotelBooking.findById(tran_id);

    if (!booking) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?reason=booking_not_found`
      );
    }

    // Step 3: Update booking status
    booking.paymentStatus = "completed";
    booking.bookingStatus = "confirmed";
    booking.paymentDetails = validation;
    await booking.save();

    // Step 4: Update room availability
    await updateRoomAvailability(
      booking.roomNumbers,
      booking.checkIn,
      booking.checkOut
    );

    // Step 5: Redirect to frontend success page
    return res.redirect(
      `${process.env.FRONTEND_URL}/hotel-payment-success/${tran_id}`
    );
  } catch (error) {
    console.error("Hotel payment success error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed?reason=server_error`
    );
  }
};

// Payment Failure Handler
export const hotelPaymentFail = async (req, res) => {
  try {
    const { tran_id } = req.params;

    await HotelBooking.findByIdAndUpdate(tran_id, {
      paymentStatus: "failed",
      bookingStatus: "cancelled",
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/hotel-payment-failed?reason=payment_failed`
    );
  } catch (error) {
    console.error("Hotel payment fail error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/hotel-payment-failed?reason=server_error`
    );
  }
};

// Payment Cancellation Handler
export const hotelPaymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.params;

    await HotelBooking.findByIdAndUpdate(tran_id, {
      paymentStatus: "pending",
      bookingStatus: "cancelled",
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/hotel-payment-cancelled/${tran_id}`
    );
  } catch (error) {
    console.error("Hotel payment cancel error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/hotel-payment-failed?reason=server_error`
    );
  }
};

// IPN Handler
export const hotelPaymentIPN = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const { status } = req.body;

    if (status === "VALID") {
      await HotelBooking.findByIdAndUpdate(tran_id, {
        paymentStatus: "completed",
        bookingStatus: "confirmed",
      });
    } else if (status === "FAILED") {
      await HotelBooking.findByIdAndUpdate(
        { transactionId: tran_id },
        {
          paymentStatus: "failed",
          bookingStatus: "cancelled",
        }
      );
    }

    return res.status(200).json({ status: "SUCCESS" });
  } catch (error) {
    console.error("Hotel payment IPN error:", error);
    return res.status(500).json({ status: "FAILED" });
  }
};

// Verify Booking Status
export const verifyHotelBooking = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const booking = await HotelBooking.findById(tran_id);

    if (!booking) {
      return res.status(404).json({ status: "not_found" });
    }

    return res.json({
      status: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      booking: {
        hotelId: booking.hotelId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalPrice,
        transactionId: booking.transactionId,
      },
    });
  } catch (error) {
    console.error("Verify hotel booking error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get Customer's Hotel Bookings
export const getCustomerHotelBookings = async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await HotelBooking.find({ customerId }).populate(
      "hotelId",
      "name city address photos"
    );

    return res.json(bookings);
  } catch (error) {
    console.error("Get customer bookings error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Cancel Hotel Booking
export const cancelHotelBooking = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    // Find the booking first to get room details
    const booking = await HotelBooking.findById(tran_id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only attempt to free up room dates if the booking was previously confirmed
    if (booking.bookingStatus === "confirmed") {
      // Remove the booked dates from each room's unavailableDates
      await removeRoomUnavailability(
        booking.roomNumbers,
        booking.checkIn,
        booking.checkOut
      );
    }

    // Update booking status
    const updatedBooking = await HotelBooking.findByIdAndUpdate(
      tran_id,
      {
        bookingStatus: bookingStatus || "cancelled",
        paymentStatus:
          paymentStatus ||
          (booking.paymentStatus === "completed"
            ? "refund-initiated"
            : "cancelled"),
      },
      { new: true }
    );

    return res.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel hotel booking error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await HotelBooking.find();
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const totalSuccessfulBookings = async (req, res, next) => {
  try {
    const totalBookings = await HotelBooking.countDocuments({
      paymentStatus: "completed",
    });

    res.status(200).json(totalBookings);
  } catch (err) {
    next(err);
  }
};

export const totalRefundedBookings = async (req, res, next) => {
  try {
    const bookings = await HotelBooking.countDocuments({
      paymentStatus: "refunded",
    });
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const totalCancelledBookings = async (req, res, next) => {
  try {
    const bookings = await HotelBooking.countDocuments({
      bookingStatus: "cancelled",
      refundAmount: { $eq: 0 },
    });
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const totalAmountOfSuccessfulBookings = async (req, res, next) => {
  try {
    const bookings = await HotelBooking.aggregate([
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

    
    res.status(200).json(bookings[0].totalAmount);
  } catch (err) {
    next(err);
  }
};

export const totalAmountOfRefundedBookings = async (req, res, next) => {
  try {
    const bookings = await HotelBooking.aggregate([
      {
        $match: {
          paymentStatus: "refunded",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$refundAmount" },
        },
      },
    ]);

    
    res.status(200).json(bookings[0].totalAmount);
  } catch (err) {
    next(err);
  }
};

export const totalBookingPriceOfRefundedBookings = async (req, res, next) => {
  try {
    const bookings = await HotelBooking.aggregate([
      {
        $match: {
          paymentStatus: "refunded",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    
    res.status(200).json(bookings[0].totalAmount);
  } catch (err) {
    next(err);
  }
};
