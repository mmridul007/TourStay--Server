import User from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import Users from "../models/Users.js";
const saltRounds = 10;

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    res.status(200).send("User registered successfully");
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// export const login = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (!user) return next(createError(404, "User not found"));

//     const isPasswordCorrect = await bcrypt.compare(
//       req.body.password,
//       user.password
//     );

//     if (!isPasswordCorrect)
//       return next(createError(400, "Wrong username or password!"));

//     const token = jwt.sign(
//       {
//         id: user._id,
//         isAdmin: user.isAdmin,
//       },
//       process.env.JWT_SECRET
//     );

//     const { password, isAdmin,  ...otherDetails } = user._doc;

//     res
//       .cookie("access-token", token, {
//         httpOnly: true,
//       })
//       .status(200)
//       .json({ details: { ...otherDetails }, isAdmin });
//   } catch (err) {
//     next(err);
//   }
// };

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) return next(createError(404, "User not found"));

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong username/email or password!"));

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET
    );

    const { password: pwd, isAdmin, ...otherDetails } = user._doc;

    res
      .cookie("access-token", token, {
        httpOnly: true,
        secure: true, // Required
        sameSite: "None", // Required
        maxAge: 7 * 24 * 60 * 60 * 1000, // Optional: 7 days
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
  } catch (err) {
    next(err);
  }
};

export const meFunction = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
