import { runGrouping } from './run-grouping';

const update = (id, previousVersion, reason) => {
  // reason on loading unpacked was 'install' (id/previousVersion were undefined)
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: '/pages/general.html?installed',
    });
  }

  if (reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // for future
  }
};

chrome.tabs.onCreated.addListener(async function (tab) {
  await runGrouping('tabCreated', tab);
});
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // although not tested, if the title of a page changes, it should regroup
  if (changeInfo.title || changeInfo.url) {
    await runGrouping('tabUpdated', tab);
  }
});
// https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
chrome.runtime.onInstalled.addListener(({ id, previousVersion, reason }) => {
  update(id, previousVersion, reason);
});

export const forTesting = {
  runGrouping,
  update,
};
