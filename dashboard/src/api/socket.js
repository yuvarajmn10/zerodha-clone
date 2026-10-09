import { io } from "socket.io-client";

// one shared connection for the whole dashboard
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:3002", {
  autoConnect: false,
  // read at connect time: index.js stores the token after this module loads
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

socket.on("connect_error", (err) => {
  console.log("SOCKET ERROR:", err.message);
});

// several components can watch overlapping symbols, so count subscribers
// per symbol and send the server the combined list
const counts = new Map();

const syncSubscriptions = () => {
  if (socket.connected) socket.emit("subscribe", [...counts.keys()]);
};

// resubscribe after (re)connecting
socket.on("connect", syncSubscriptions);

const ensureConnected = () => {
  if (!socket.connected) socket.connect();
};

// Calls onQuotes({ NAME: { price, percent, isDown } }) whenever the server
// pushes prices. Returns an unsubscribe function.
export const subscribeQuotes = (names, onQuotes) => {
  names.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
  socket.on("quotes", onQuotes);
  ensureConnected();
  syncSubscriptions();

  return () => {
    names.forEach((n) => {
      const c = counts.get(n) - 1;
      if (c > 0) counts.set(n, c);
      else counts.delete(n);
    });
    socket.off("quotes", onQuotes);
    syncSubscriptions();
  };
};

// Calls onChange() after any buy/sell. Returns an unsubscribe function.
export const onPortfolioChange = (onChange) => {
  socket.on("portfolio", onChange);
  ensureConnected();

  return () => socket.off("portfolio", onChange);
};

export default socket;

// overlay pushed prices onto holdings/positions rows
export const withQuotes = (items, quotes) =>
  items.map((item) => {
    const q = quotes[item.name];
    if (!q) return item;
    return { ...item, price: q.price, day: q.percent, isLoss: q.isDown };
  });
