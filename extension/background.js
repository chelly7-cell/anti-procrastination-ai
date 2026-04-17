let activeSite = null;
let startTime = Date.now();

// 🚨 YouTube tracking
let youtubeTime = 0;
let youtubeInterval = null;

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

// tab switch
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleChange(tab.url, activeInfo.tabId);
});

// tab update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && changeInfo.status === "complete") {
    handleChange(tab.url, tabId);
  }
});

// 🚀 MAIN TRACKING
function handleChange(url, tabId) {
  const site = getHostname(url);
  if (!site) return;

  const now = Date.now();
  const timeSpent = (now - startTime) / 1000 / 60;

  // send previous site data
  if (activeSite) {
    sendToBackend(activeSite, timeSpent);
  }

  activeSite = site;
  startTime = now;

  console.log("Switched to:", site);

  // 🎯 YouTube tracking
  if (site.includes("youtube.com")) {
    startYouTubeTracking(tabId);
  } else {
    stopYouTubeTracking();
  }
}

// ▶️ START YouTube timer
function startYouTubeTracking(tabId) {
  if (youtubeInterval) return;

  youtubeInterval = setInterval(() => {
    youtubeTime++;

    console.log("YouTube time (sec):", youtubeTime);

    // send every 10 seconds
    if (youtubeTime % 10 === 0) {
      sendToBackend("youtube.com", 10 / 60);
    }

    // 🚫 BLOCK at 30 minutes
    if (youtubeTime >= 1800) {
      blockSite(tabId);
    }
  }, 1000);
}

// ⛔ STOP YouTube timer
function stopYouTubeTracking() {
  clearInterval(youtubeInterval);
  youtubeInterval = null;
}

// 📡 SEND TO BACKEND
function sendToBackend(site, time) {
  fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      site,
      time: Number(time.toFixed(2))
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Backend response:", data);

      if (data.status === "DISTRACTED") {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    chrome.tabs.sendMessage(tabs[0].id, {
      type: "SHOW_ALERT",
      text: data.message
    });
  });
}
    })
    .catch(err => console.error("Backend error:", err));
}

// 🚫 BLOCK SITE
function blockSite(tabId) {
  chrome.tabs.update(tabId, {
    url: "https://www.google.com/search?q=focus+mode+activated"
  });

  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon.png"),
    title: "🚫 Focus Mode",
    message: "You reached 30 minutes on YouTube!",
    priority: 2
  });

  // reset timer
  youtubeTime = 0;
}