import jwt from "jsonwebtoken";
import { createError } from "./error.js";

export const verifyToken = (req, res, nextCallback) => {
  const token = req.cookies["access-token"];
  if (!token) {
    return nextCallback(createError(401, "You are not authorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return nextCallback(createError(403, "Token is not valid"));
    }
    req.user = user;
    nextCallback();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(createError(405, "You are not authorized"));
    }
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    if (req.user.isAdmin) {
      next();
    } else {
      return next(createError(405, "You are not authorized"));
    }
  });
};
