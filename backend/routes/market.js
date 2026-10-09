const express = require("express");
const YahooFinance = require("yahoo-finance2").default;

const auth = require("../middleware/auth");

const router = express.Router();

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// watchlist names that aren't the real NSE trading symbol
const ALIASES = { HUL: "HINDUNILVR" };

// indices shown in the top bar
const INDICES = { "NIFTY 50": "^NSEI", SENSEX: "^BSESN" };

// Yahoo's free endpoint is unofficial; cache so polling dashboards
// don't hammer it and get rate-limited
const CACHE_MS = 5000;
const cache = new Map(); // "INFY.NS" -> { price, percent, at }
let inflight = Promise.resolve();

const toYahoo = (name) => INDICES[name] || `${ALIASES[name] || name}.NS`;

const refresh = async (symbols) => {
  const now = Date.now();
  const stale = symbols.filter(
    (s) => !cache.has(s) || now - cache.get(s).at > CACHE_MS,
  );
  if (!stale.length) return;

  const res = await yahooFinance.quote(stale, { return: "object" });
  for (const s of stale) {
    const q = res[s];
    if (q && typeof q.regularMarketPrice === "number") {
      cache.set(s, {
        price: q.regularMarketPrice,
        percent: q.regularMarketChangePercent || 0,
        at: now,
      });
    }
  }
};

// Returns { NAME: { price, percent, isDown } } for the names Yahoo knows;
// unknown symbols (or a Yahoo outage) are left out so callers fall back
// to stored prices.
const getLiveQuotes = async (names) => {
  if (!names.length) return {};

  const symbols = [...new Set(names.map(toYahoo))];

  // serialise Yahoo calls so concurrent requests share one fetch
  const run = inflight.then(() => refresh(symbols));
  inflight = run.catch(() => {});

  try {
    await run;
  } catch (err) {
    console.log("YAHOO QUOTE ERROR:", err.message || err);
  }

  const quotes = {};
  for (const n of names) {
    const q = cache.get(toYahoo(n));
    if (!q) continue;
    quotes[n] = {
      price: q.price,
      percent: `${q.percent >= 0 ? "+" : ""}${q.percent.toFixed(2)}%`,
      isDown: q.percent < 0,
    };
  }
  return quotes;
};

router.get("/quotes", auth, async (req, res) => {
  const names = String(req.query.symbols || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  res.json(await getLiveQuotes(names));
});

module.exports = { marketRoutes: router, getLiveQuotes };
