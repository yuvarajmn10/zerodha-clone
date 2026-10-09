require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/account");
const { marketRoutes, getLiveQuotes } = require("./routes/market");
const attachSocket = require("./socket");

const auth = require("./middleware/auth");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const User = require("./model/UserModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/zerodha";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://zerodha-clone-frontend-one.vercel.app",
  "https://zerodha-clone-dashboard-fmx09ofy2-gurukiran615s-projects.vercel.app",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : []),
];

const app = express();
const server = http.createServer(app);
const io = attachSocket(server, allowedOrigins);
app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

// health check so opening the API URL in a browser shows it's up
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/", accountRoutes);

// app.get("/addHoldings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.day,
//       day: item.day,
//     });

//     newHolding.save();
//   });
//   res.send("Done!");
// });
// app.get("/addPositions", async (req, res) => {
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });

// replace stored prices with live Zerodha prices when Kite is connected
const withLivePrices = async (docs) => {
  const items = docs.map((d) => d.toObject());
  const quotes = await getLiveQuotes(items.map((i) => i.name));

  return items.map((item) => {
    const q = quotes[item.name];
    if (!q) return item;
    return { ...item, price: q.price, day: q.percent, isLoss: q.isDown };
  });
};

app.get("/allHoldings", auth, async (req, res) => {
  let allHoldings = await HoldingsModel.find({ user: req.user.id });
  res.json(await withLivePrices(allHoldings));
});

app.get("/allPositions", auth, async (req, res) => {
  let allPositions = await PositionsModel.find({ user: req.user.id });
  res.json(await withLivePrices(allPositions));
});

const round2 = (n) => Math.round(n * 100) / 100;

app.post("/newOrder", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mode } = req.body;
    const qty = Number(req.body.qty);

    if (!name || !["BUY", "SELL"].includes(mode) || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).send("Invalid order");
    }

    // market order: fill at the live price, fall back to the entered price
    // for instruments we can't quote
    const live = (await getLiveQuotes([name]))[name];
    const price = round2(live ? live.price : Number(req.body.price));
    if (!(price > 0)) {
      return res.status(400).send("Invalid price");
    }
    const value = round2(price * qty);

    if (mode === "BUY") {
      // check and deduct cash in one atomic update
      const user = await User.findOneAndUpdate(
        { _id: userId, cash: { $gte: value } },
        { $inc: { cash: -value } },
      );
      if (!user) {
        return res.status(400).send("Insufficient funds");
      }

      const holding = await HoldingsModel.findOne({ user: userId, name });
      if (holding) {
        holding.avg = (holding.avg * holding.qty + value) / (holding.qty + qty);
        holding.qty += qty;
        holding.price = price;
        await holding.save();
      } else {
        await HoldingsModel.create({ user: userId, name, qty, avg: price, price });
      }
    }

    if (mode === "SELL") {
      // check and reduce quantity in one atomic update
      const holding = await HoldingsModel.findOneAndUpdate(
        { user: userId, name, qty: { $gte: qty } },
        { $inc: { qty: -qty }, $set: { price } },
        { new: true },
      );
      if (!holding) {
        return res.status(400).send("Insufficient stock");
      }
      if (holding.qty === 0) {
        await HoldingsModel.deleteOne({ _id: holding._id });
      }

      await User.updateOne({ _id: userId }, { $inc: { cash: value } });
    }

    await OrdersModel.create({ user: userId, name, qty, price, mode });

    // tell this user's open dashboards to refresh
    io.to(`user:${userId}`).emit("portfolio");

    res.send(`${mode === "BUY" ? "Bought" : "Sold"} ${qty} ${name} at ₹${price}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error processing order");
  }
});

app.get("/orders", auth, async (req, res) => {
  try {
    const orders = await OrdersModel.find({ user: req.user.id }).sort({ _id: -1 }); // latest first
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching orders");
  }
});

// accounts created before funds/watchlists existed get the defaults
const migrateUsers = () =>
  Promise.all([
    User.updateMany(
      { cash: { $exists: false } },
      { $set: { cash: User.STARTING_CASH, totalAdded: User.STARTING_CASH, totalWithdrawn: 0 } },
    ),
    User.updateMany(
      { watchlist: { $exists: false } },
      { $set: { watchlist: User.DEFAULT_WATCHLIST } },
    ),
  ]);

mongoose
  .connect(uri)
  .then(migrateUsers)
  .then(() => {
    console.log("DB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB connection error:", err);
    process.exit(1);
  });
