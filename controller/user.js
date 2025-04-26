import Users from "../models/Users.js";

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deleteUser = await Users.findByIdAndDelete(req.params.id);
    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json("User has been deleted");
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await Users.find();
    if (!users) {
      return res.status(404).json({ message: "There are no Users" });
    }
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getPaymentRequestedUsers = async (req, res, next) => {
  try {
    const paymentRequestedUsers = await Users.find({
      withdrawalStatus: "pending",
      withdrawalHoldAmount: { $gt: 0 },
    });

    if (!paymentRequestedUsers) {
      return res.status(404).json({ message: "There are no Users" });
    }
    res.status(200).json(paymentRequestedUsers);
  } catch (err) {
    next(err);
  }
};

export const getTotalUser = async (req, res, next) => {
  try {
    const totalUser = await Users.countDocuments();
    if (totalUser === null) {
      return res.status(404).json({ message: "There are no Users" });
    }
    res.status(200).json(totalUser);
  } catch (err) {
    next(err);
  }
}

export const totalWithdrawalRequest = async (req, res, next) => {
  try {
    const totalWithdrawalRequest = await Users.countDocuments({
      withdrawalStatus: "pending",
      withdrawalHoldAmount: { $gt: 0 },
    });
    if (totalWithdrawalRequest === null) {
      return res.status(404).json({ message: "There are no Users" });
    }
    res.status(200).json(totalWithdrawalRequest);
  } catch (err) {
    next(err);
  }
}

export const totalNumbersOfAdmin = async (req, res, next) => {
  try {
    const totalNumbersOfAdmin = await Users.countDocuments({
      isAdmin: "true",
    });
    if (totalNumbersOfAdmin === null) {
      return res.status(404).json({ message: "There are no Users" });
    }
    res.status(200).json(totalNumbersOfAdmin);
  } catch (err) {
    next(err);
  }
}