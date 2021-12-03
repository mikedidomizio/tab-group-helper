import { LineItemsService } from '../Popup/service/lineItems.service';
import { TabService } from '../Popup/service/tab.service';

// todo would be nice to write this in typescript and compile for background scripts
/**
 * @param {'tabCreated' | 'tabUpdated' | undefined} autoGroupType
 * @param tab
 * @returns {Promise<void>}
 */
export const runGrouping = async (autoGroupType, tab) => {
  const lineItemsService = new LineItemsService();
  const tabService = new TabService();

  const lineItems = await lineItemsService.get();
  // immediately filter where apply is true, we ignore otherwise
  const lineItemsSetToAppl = lineItems.filter((i) => {
    if (autoGroupType) {
      return i.applyChanges && i.autoGroup.includes(autoGroupType);
    }

    return i.applyChanges;
  });

  for (let item of lineItemsSetToAppl) {
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
    const ids = matchedTabs.map((i) => (i.id ? i.id : -1));
    const color = item.color !== '' ? item.color : undefined;

    if (tab && ids.includes(tab?.id)) {
      await tabService.addTabsToGroup([tab.id], item.groupTitle, color);
    } else if (ids.length) {
      await tabService.addTabsToGroup(ids, item.groupTitle, color);
    }
  }
};
