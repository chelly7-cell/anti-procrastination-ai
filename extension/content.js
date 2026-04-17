// content.js

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_ALERT") {
    showAlert(message.text);
  }
});

function showAlert(text) {
  const alertBox = document.createElement("div");

  alertBox.innerText = text;

  alertBox.style.position = "fixed";
  alertBox.style.top = "20px";
  alertBox.style.right = "20px";
  alertBox.style.padding = "15px 20px";
  alertBox.style.backgroundColor = "red";
  alertBox.style.color = "white";
  alertBox.style.fontSize = "16px";
  alertBox.style.borderRadius = "8px";
  alertBox.style.zIndex = "999999";
  alertBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}