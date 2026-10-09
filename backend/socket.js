const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const { getLiveQuotes } = require("./routes/market");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

// how often live prices are pushed to connected dashboards
const PUSH_MS = 5000;
const MAX_SYMBOLS = 100;

// Events:
//   client -> server  "subscribe"  [names]   replaces this socket's symbol list
//   server -> client  "quotes"     { NAME: { price, percent, isDown } }
//   server -> client  "portfolio"  this user's holdings/positions/orders/funds changed
module.exports = (server, corsOrigins) => {
  const io = new Server(server, {
    cors: { origin: corsOrigins, credentials: true },
  });

  // only logged-in users get a socket
  io.use((socket, next) => {
    try {
      socket.data.user = jwt.verify(socket.handshake.auth?.token, JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // one upstream fetch for every symbol anyone is watching, then each
  // socket gets just the prices it subscribed to
  const pushQuotes = async (sockets) => {
    const names = [...new Set(sockets.flatMap((s) => [...s.data.symbols]))];
    if (!names.length) return;

    const quotes = await getLiveQuotes(names);

    for (const s of sockets) {
      const mine = {};
      for (const n of s.data.symbols) {
        if (quotes[n]) mine[n] = quotes[n];
      }
      if (Object.keys(mine).length) s.emit("quotes", mine);
    }
  };

  io.on("connection", (socket) => {
    socket.data.symbols = new Set();
    // per-user room so portfolio updates only reach that user's tabs
    socket.join(`user:${socket.data.user.id}`);

    socket.on("subscribe", (names) => {
      if (!Array.isArray(names)) return;

      socket.data.symbols = new Set(
        names.filter((n) => typeof n === "string").slice(0, MAX_SYMBOLS),
      );
      // don't make a new subscriber wait for the next tick
      pushQuotes([socket]).catch((err) => console.log("SOCKET PUSH ERROR:", err));
    });
  });

  setInterval(() => {
    const sockets = [...io.sockets.sockets.values()];
    if (sockets.length) {
      pushQuotes(sockets).catch((err) => console.log("SOCKET PUSH ERROR:", err));
    }
  }, PUSH_MS);

  return io;
};
