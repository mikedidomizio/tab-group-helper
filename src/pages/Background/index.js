console.log('background script successfully loaded');

chrome.tabs.onCreated.addListener(async function (tab) {
  // todo should group the new tab on create
});
