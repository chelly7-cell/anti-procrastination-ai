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

  // 🔥 normalize site (remove www)
  site = site.replace("www.", "");

  // save raw data
  stats.push({
    site,
    time,
    date: new Date().toISOString()
  });

  // 🔥 accumulate time
  if (!siteTotals[site]) {
    siteTotals[site] = 0;
  }

  siteTotals[site] += time;

  let status = "FOCUSED";
  let message = "Good job!";

  // 🔥 check DISTRACTION based on TOTAL time
  if (
    distractingSites.some(s => site.includes(s)) &&
    siteTotals[site] >= 1
  ) {
    status = "DISTRACTED";
    message = `⚠️ You spent ${siteTotals[site].toFixed(1)} min on ${site}. Go back to work!`;
  }

  console.log("TOTAL:", site, siteTotals[site]);

  res.json({ status, message });
});

app.get("/stats", (req, res) => {
  res.json(stats);
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});