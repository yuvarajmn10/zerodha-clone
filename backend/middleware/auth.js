const jwt = require("jsonwebtoken");

const User = require("../model/UserModel");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  // extract token from "Bearer <token>" (also accept a bare token)
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }

  // a valid token can still point at a deleted user, or one from another
  // database (e.g. after switching MONGO_URL), so make them log in again
  if (!(await User.exists({ _id: decoded.id }))) {
    return res.status(401).json({ message: "Account not found, please log in again" });
  }

  req.user = decoded;
  next();
};
