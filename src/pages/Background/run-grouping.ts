import { LineItem, LineItemsService } from '../Popup/service/lineItems.service';
import { TabService } from '../Popup/service/tab.service';

// immediately filter where apply is true, we ignore otherwise
const lineItemApplyFilter = (
  lineItem: LineItem,
  autoGroupType?: 'tabCreated' | 'tabUpdated'
) => {
  return autoGroupType
    ? lineItem.applyChanges && lineItem.autoGroup.includes(autoGroupType)
    : lineItem.applyChanges;
};

const getIdsOfMatchedTabs = (chromeTab: chrome.tabs.Tab) =>
  chromeTab.id ? chromeTab.id : -1;

/**
 * @param {'tabCreated' | 'tabUpdated' | undefined} autoGroupType
 * @param tab
 * @returns {Promise<void>}
 */
export const runGrouping = async (
  autoGroupType?: 'tabCreated' | 'tabUpdated',
  tab?: chrome.tabs.Tab
) => {
  const lineItemsService = new LineItemsService();
  const tabService = new TabService();
  const lineItems = await lineItemsService.get();
  const lineItemsSetToApply = lineItems.filter((lineItem) =>
    lineItemApplyFilter(lineItem, autoGroupType)
  );

  for (let item of lineItemsSetToApply) {
    const regex = item.regex;
    const { caseSensitive } = item;
    const matchedTabs = await tabService.getTabsWhichMatch(
      item.text,
      item.matchType,
      caseSensitive,
      regex,
      true
    );
    // if id for some reason is undefined, we return -1
    // not exactly sure what would happen there if an error is thrown or it continues if trying to add
    // -1 tab to a group
    const ids = matchedTabs.map(getIdsOfMatchedTabs);
    const color = item.color !== '' ? item.color : undefined;

    const tabsToGroup = tab && tab?.id && ids.includes(tab.id) ? [tab.id] : ids;
    await tabService.addTabsToGroup(tabsToGroup, item.groupTitle, color);
  }
};
