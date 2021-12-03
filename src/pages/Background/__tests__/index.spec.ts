import {
  chrome,
  chromeTabsQueryPromiseResponse,
  generateFakeTab,
} from '../../Popup/__tests-helpers__/functions';
import { autoGroupValue } from '../../Popup/components/LineItem';
import {
  LineItemsService,
  newLineItem,
} from '../../Popup/service/lineItems.service';
import { TabService } from '../../Popup/service/tab.service';

global.chrome = chrome;
const { forTesting } = require('../index');

const { runGrouping, update } = forTesting;

describe('update function', () => {
  beforeAll(() => {
    chrome.runtime.OnInstalledReason = {
      INSTALL: 'install',
      UPDATE: 'update,',
    };
  });

  it('should open up the general page on installed with installed as a query param', () => {
    const createSpy = jest.spyOn(chrome.tabs, 'create');
    update(undefined, undefined, chrome.runtime.OnInstalledReason.INSTALL);
    expect(createSpy).toHaveBeenCalledWith({
      url: '/pages/general.html?installed',
    });
  });
});

describe('regroup function', () => {
  let matchedTabsSpy: jest.SpyInstance;
  let addTabsToGroupSpy: jest.SpyInstance;

  const firstTab = generateFakeTab({
    title: 'react - good times',
    url: 'react.com',
  });
  const secondTab = generateFakeTab({
    title: 'facebook',
    url: 'facebook.com',
  });

  beforeAll(() => {
    global.chrome = chrome;
  });

  beforeEach(() => {
    addTabsToGroupSpy = jest
      .spyOn(TabService.prototype, 'addTabsToGroup')
      .mockReturnValue(Promise.resolve({} as any));
    chromeTabsQueryPromiseResponse([firstTab, secondTab]);
    matchedTabsSpy = jest.spyOn(TabService.prototype, 'getTabsWhichMatch');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should filter out line items that don't have apply", async () => {
    const newItemApply = newLineItem();
    const newItemNoApply = newLineItem();

    newItemApply.autoGroup.push(autoGroupValue.tabCreated);
    newItemApply.text = 'match';

    newItemNoApply.applyChanges = false;
    newItemNoApply.autoGroup.push(autoGroupValue.tabCreated);
    newItemNoApply.text = 'no-match';

    jest
      .spyOn(LineItemsService.prototype, 'get')
      .mockReturnValue(Promise.resolve([newItemApply, newItemNoApply]));

    await runGrouping(autoGroupValue.tabCreated);

    expect(matchedTabsSpy).toHaveBeenCalledTimes(1);
    expect(matchedTabsSpy).toHaveBeenCalledWith(
      'match',
      'url',
      false,
      false,
      true
    );
  });

  it("should filter out line items that don't match the auto group type", async () => {
    const newItemMatchingGroup = newLineItem();
    const newItemBadGroup = newLineItem();

    newItemMatchingGroup.autoGroup.push(autoGroupValue.tabCreated);
    newItemMatchingGroup.text = 'match';

    newItemBadGroup.autoGroup.push(autoGroupValue.tabUpdated);
    newItemBadGroup.text = 'no-match';

    jest
      .spyOn(LineItemsService.prototype, 'get')
      .mockReturnValue(
        Promise.resolve([newItemMatchingGroup, newItemBadGroup])
      );

    await runGrouping(autoGroupValue.tabCreated);

    expect(matchedTabsSpy).toHaveBeenCalledTimes(1);
    expect(matchedTabsSpy).toHaveBeenCalledWith(
      'match',
      'url',
      false,
      false,
      true
    );
  });

  it('should only add the newly created tab to group on creation of a new tab, and not existing tabs', async () => {
    const newItemMatchingGroup = newLineItem();
    const newItemBadGroup = newLineItem();

    newItemMatchingGroup.autoGroup.push(autoGroupValue.tabCreated);
    newItemMatchingGroup.text = 'facebook';
    newItemMatchingGroup.color = 'blue';
    newItemMatchingGroup.groupTitle = 'social media';

    newItemBadGroup.autoGroup.push(autoGroupValue.tabUpdated);
    newItemBadGroup.text = 'no-match';

    jest
      .spyOn(LineItemsService.prototype, 'get')
      .mockReturnValue(
        Promise.resolve([newItemMatchingGroup, newItemBadGroup])
      );

    // we use facebook here as we "already have" a facebook tab and want to ensure the existing tab
    // isn't also added to the group, only new tabs
    const newTab = generateFakeTab({
      url: 'facebook.com/dev',
      title: 'facebook devs',
    });

    chromeTabsQueryPromiseResponse([firstTab, secondTab, newTab]);

    await runGrouping(autoGroupValue.tabCreated, newTab);

    expect(addTabsToGroupSpy).toBeCalledWith(
      [newTab.id],
      'social media',
      'blue'
    );
  });

  it('should only update the recently changed tab', async () => {
    const newItemMatchingGroup = newLineItem();
    const newItemBadGroup = newLineItem();

    newItemMatchingGroup.autoGroup.push(autoGroupValue.tabUpdated);
    newItemMatchingGroup.text = 'facebook';
    newItemMatchingGroup.color = 'blue';
    newItemMatchingGroup.groupTitle = 'social media';

    newItemBadGroup.autoGroup.push(autoGroupValue.tabCreated);
    newItemBadGroup.text = 'no-match';

    jest
      .spyOn(LineItemsService.prototype, 'get')
      .mockReturnValue(
        Promise.resolve([newItemMatchingGroup, newItemBadGroup])
      );

    chromeTabsQueryPromiseResponse([firstTab, secondTab]);

    firstTab.url = 'https://facebook.com/my-new-url';

    await runGrouping(autoGroupValue.tabUpdated, firstTab);

    expect(addTabsToGroupSpy).toBeCalledWith(
      [firstTab.id],
      'social media',
      'blue'
    );
  });
});
