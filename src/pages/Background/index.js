import { TabService } from '../Popup/service/tab.service';
import { LineItemsService } from '../Popup/service/lineItems.service';

// todo very similar to the one found in Board.tsx and should not be duplicated
chrome.tabs.onCreated.addListener(async function (tab) {
  const lineItemsService = new LineItemsService();
  const tabsService = new TabService();

  let lineItems = await lineItemsService.get();
  // immediately filter where apply is true, we ignore otherwise
  lineItems = lineItems.filter((i) => i.applyChanges && i.autoGroup === true);

  for (let item of lineItems) {
    const regex = item.regex;
    const { caseSensitive } = item;
    const returned = await new TabService().getTabsWhichMatch(
      item.text,
      item.matchType,
      caseSensitive,
      regex
    );
    // if id for some reason is undefined, we return -1
    // not exactly sure what would happen there if an error is thrown or it continues if trying to add
    // -1 tab to a group
    const ids = returned.map((i) => (i.id ? i.id : -1));
    if (ids.length) {
      const color = item.color !== '' ? item.color : undefined;
      await tabsService.addTabsToGroup(ids, item.groupTitle, color);
    }
  }
});
