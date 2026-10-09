const express = require("express");

const auth = require("../middleware/auth");
const User = require("../model/UserModel");
const { getLiveQuotes } = require("./market");

const router = express.Router();

const MAX_TRANSFER = 10000000; // ₹1 crore per add/withdraw
const MAX_WATCHLIST = 50;

const round2 = (n) => Math.round(n * 100) / 100;

const accountJson = (user) => ({
  username: user.username,
  email: user.email,
  cash: round2(user.cash),
  totalAdded: round2(user.totalAdded),
  totalWithdrawn: round2(user.totalWithdrawn),
});

// let the user's open dashboards know their numbers changed
const notify = (req) =>
  req.app.get("io").to(`user:${req.user.id}`).emit("portfolio");

const parseAmount = (value) => {
  const amount = round2(Number(value));
  return amount > 0 && amount <= MAX_TRANSFER ? amount : null;
};

router.get("/account", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(accountJson(user));
});

router.post("/funds/add", auth, async (req, res) => {
  const amount = parseAmount(req.body.amount);
  if (!amount) return res.status(400).send("Enter a valid amount");

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { cash: amount, totalAdded: amount } },
    { returnDocument: "after" },
  );
  notify(req);
  res.json(accountJson(user));
});

router.post("/funds/withdraw", auth, async (req, res) => {
  const amount = parseAmount(req.body.amount);
  if (!amount) return res.status(400).send("Enter a valid amount");

  // the cash check and the deduction happen in one atomic update
  const user = await User.findOneAndUpdate(
    { _id: req.user.id, cash: { $gte: amount } },
    { $inc: { cash: -amount, totalWithdrawn: amount } },
    { returnDocument: "after" },
  );
  if (!user) return res.status(400).send("Insufficient funds");

  notify(req);
  res.json(accountJson(user));
});

router.get("/watchlist", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user ? user.watchlist : []);
});

router.post("/watchlist", auth, async (req, res) => {
  const name = String(req.body.name || "").trim().toUpperCase();
  if (!name) return res.status(400).send("Enter a symbol");

  // only accept symbols we can actually price
  const quotes = await getLiveQuotes([name]);
  if (!quotes[name]) {
    return res.status(400).send(`${name} is not a known NSE symbol`);
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.id, [`watchlist.${MAX_WATCHLIST - 1}`]: { $exists: false } },
    { $addToSet: { watchlist: name } },
    { returnDocument: "after" },
  );
  if (!user) return res.status(400).send(`Watchlist is limited to ${MAX_WATCHLIST}`);

  res.json(user.watchlist);
});

router.delete("/watchlist/:name", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { watchlist: req.params.name } },
    { returnDocument: "after" },
  );
  res.json(user ? user.watchlist : []);
});

module.exports = router;
