import { runGrouping } from './run-grouping';

const update = (id, previousVersion, reason) => {
  // reason on loading unpacked was 'install' (id/previousVersion were undefined)
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: '/pages/general.html?installed',
    });
  }

  if (reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // ex. 1.10.0
    const extensionVersion = chrome.runtime.getManifest().version;
    // v1_10_0
    const parseExtensionVersion = 'v' + extensionVersion.replaceAll('.', '_');

    chrome.tabs.create({
      url: '/pages/general.html?newVersion=' + parseExtensionVersion,
    });
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
// fired on first install, when extension is updated to a new version, and when Chrome is updated to a new version.
chrome.runtime.onInstalled.addListener(({ id, previousVersion, reason }) => {
  update(id, previousVersion, reason);
});
// custom shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const commands = {
    runGrouping: 'run_grouping',
  };

  if (command === commands.runGrouping) {
    await runGrouping();
  }
});
