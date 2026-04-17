const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let stats = [];

// 🔥 store TOTAL time per site
let siteTotals = {};

const distractingSites = ["youtube.com", "instagram.com", "tiktok.com"];

app.get("/", (req, res) => {
  res.send("🔥 Anti-Procrastination API running");
});

app.post("/analyze", (req, res) => {
  let { site, time } = req.body;

  site = (site || "").replace("www.", "");
  time = Number(time) || 0;

  stats.push({
    site,
    time,
    date: new Date().toISOString()
  });

  if (stats.length > 1000) stats.shift();

  if (!siteTotals[site]) {
    siteTotals[site] = 0;
  }

  siteTotals[site] += time;

  let status = "FOCUSED";
  let message = "Good job!";

  if (
    distractingSites.some(s => site.includes(s)) &&
    siteTotals[site] >= 1
  ) {
    status = "DISTRACTED";
    message = `⚠️ You spent ${siteTotals[site].toFixed(1)} min on ${site}`;
  }

  res.json({ status, message });
});

app.get("/stats", (req, res) => {
  res.json(stats);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});