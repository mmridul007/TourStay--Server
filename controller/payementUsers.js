import PaymentUsers from "../models/PaymentUsers.js";
import Users from "../models/Users.js";

// export const createPaymentSuccess = async (req, res, next) => {
//   try {
//     const {
//       userId,
//       withdrawMethod,
//       withdrawalHoldAmount,
//       withdrawalNumber,
//       withdrawalStatus,
//     } = req.body;

//     // Find the user by ID
//     const user = await Users.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update the user's withdrawal status and amount
//     user.withdrawalStatus = "success";
//     user.withdrawalHoldAmount -= withdrawalHoldAmount;
//     user.totalWithdraw += withdrawalHoldAmount;
//     await user.save();

//     // Create a new payment record
//     const newPayment = new PaymentUsers({
//       userId,
//       username: user.username,
//       withdrawMethod,
//       withdrawAmount: withdrawalHoldAmount,
//       withdrawalNumber,
//       withdrawalStatus,
//     });
//     await newPayment.save();

//     res.status(200).json({ message: "Payment successful", user });
//   } catch (err) {
//     next(err);
//   }
// };

export const createPaymentSuccess = async (req, res, next) => {
  try {
    const {
      userId,
      withdrawMethod,
      withdrawalHoldAmount,
      withdrawalNumber,
      withdrawalStatus,
    } = req.body;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pendingIndex = user.withdrawHistory.findIndex(
      (entry) =>
        entry.withdrawStatus === "pending" &&
        entry.amount === withdrawalHoldAmount
    );

    if (pendingIndex !== -1) {
      user.withdrawHistory[pendingIndex].withdrawStatus = "success";
    }

    user.withdrawalStatus = "success";
    user.withdrawalHoldAmount -= withdrawalHoldAmount;
    user.totalWithdraw += withdrawalHoldAmount;
    await user.save();

   
    const newPayment = new PaymentUsers({
      userId,
      username: user.username,
      withdrawMethod,
      withdrawAmount: withdrawalHoldAmount,
      withdrawalNumber,
      withdrawalStatus,
    });
    await newPayment.save();

    res.status(200).json({ message: "Payment successful", user });
  } catch (err) {
    next(err);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await PaymentUsers.find();
    if (!payments) {
      return res.status(404).json({ message: "No payments found" });
    }
    res.status(200).json(payments);
  } catch (err) {
    next(err);
  }
};
