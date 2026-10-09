const mongoose = require("mongoose");

// every new account starts with virtual cash and a starter watchlist
const STARTING_CASH = 100000;
const DEFAULT_WATCHLIST = [
  "INFY",
  "ONGC",
  "TCS",
  "KPITTECH",
  "QUICKHEAL",
  "WIPRO",
  "M&M",
  "RELIANCE",
  "HINDUNILVR",
];

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  cash: { type: Number, default: STARTING_CASH },
  totalAdded: { type: Number, default: STARTING_CASH },
  totalWithdrawn: { type: Number, default: 0 },
  watchlist: { type: [String], default: () => [...DEFAULT_WATCHLIST] },
});

module.exports = mongoose.model("User", userSchema);
module.exports.STARTING_CASH = STARTING_CASH;
module.exports.DEFAULT_WATCHLIST = DEFAULT_WATCHLIST;
