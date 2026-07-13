const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  console.log("HEADER:", header); //  debug

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  // =extract token from "Bearer <token>"
  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;

    console.log("USER:", decoded); //  debug

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
