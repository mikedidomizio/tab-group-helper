import { LineItemsService } from '../Popup/service/lineItems.service';
import { TabService } from '../Popup/service/tab.service';

/**
 * @param {'tabCreated' | 'tabUpdated'} autoGroupType
 * @param tab
 * @returns {Promise<void>}
 */
// todo very similar to the one found in Board.tsx and should not be duplicated
// todo seems to be some bug where it doesn't always auto-group?  can't tell if reloading the extension fixes it
const regroup = async (autoGroupType, tab) => {
  const lineItemsService = new LineItemsService();
  const tabsService = new TabService();

  let lineItems = await lineItemsService.get();
  // immediately filter where apply is true, we ignore otherwise
  lineItems = lineItems.filter(
    (i) => i.applyChanges && i.autoGroup.includes(autoGroupType)
  );

  for (let item of lineItems) {
    const regex = item.regex;
    const { caseSensitive } = item;
    const returned = await tabsService.getTabsWhichMatch(
      item.text,
      item.matchType,
      caseSensitive,
      regex,
      true
    );
    // if id for some reason is undefined, we return -1
    // not exactly sure what would happen there if an error is thrown or it continues if trying to add
    // -1 tab to a group
    const ids = returned.map((i) => (i.id ? i.id : -1));
    if (ids.includes(tab?.id)) {
      const color = item.color !== '' ? item.color : undefined;
      await tabsService.addTabsToGroup([tab.id], item.groupTitle, color);
    }
  }
};

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
  await regroup('tabCreated', tab);
});
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // although not tested, if the title of a page changes, it should regroup
  if (changeInfo.title || changeInfo.url) {
    await regroup('tabUpdated', tab);
  }
});
// https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
chrome.runtime.onInstalled.addListener(({ id, previousVersion, reason }) => {
  update(id, previousVersion, reason);
});

export const forTesting = {
  regroup,
  update,
};
