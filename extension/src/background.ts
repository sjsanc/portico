// Background service worker for the extension

console.log("Extension background script loaded");

chrome.action.onClicked.addListener((tab) => {
  console.log("Hello world");
});

// Listen for messages from popup to update icon
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.bookmarkExists !== undefined) {
    const iconPath = request.bookmarkExists ? 'icons/star.png' : 'icons/star_white.png'
    chrome.action.setIcon({ path: iconPath })
  }
})

function clickMe() {
  console.log("click me")
}