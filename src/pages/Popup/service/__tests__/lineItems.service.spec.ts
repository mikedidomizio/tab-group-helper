import { chrome } from '../../__tests-helpers__/functions';
import { LineItem, LineItemsService, newLineItem } from '../lineItems.service';

beforeAll(function () {
  (global as any).chrome = chrome;
});

describe('lineItems service', () => {
  describe('move line items method', () => {
    let lineItem: LineItem;
    let lineItem2: LineItem;

    beforeEach(() => {
      lineItem = newLineItem();
      lineItem2 = newLineItem();
      lineItem.text = 'lineitem 1';
      lineItem2.text = 'lineitem 2';
      chrome.storage.local.get.yields({ lineItems: [lineItem, lineItem2] });
      chrome.storage.local.set.yields({});
    });

    describe('up direction', () => {
      it("should move an item up if it's not the first", async () => {
        const lineItemsService = new LineItemsService();
        const setSpy = jest.spyOn(lineItemsService, 'set');
        await lineItemsService.moveLineItem(lineItem2.id, 'up');
        expect(setSpy).toHaveBeenCalledWith([lineItem2, lineItem]);
      });

      it("should not make a change if it's already at the top of the tests", async () => {
        const lineItemsService = new LineItemsService();
        const setSpy = jest.spyOn(lineItemsService, 'set');
        await lineItemsService.moveLineItem(lineItem.id, 'up');
        expect(setSpy).not.toHaveBeenCalled();
      });
    });

    describe('down direction', () => {
      it("should move an item down if it's not the last", async () => {
        const lineItemsService = new LineItemsService();
        const setSpy = jest.spyOn(lineItemsService, 'set');
        await lineItemsService.moveLineItem(lineItem.id, 'down');
        expect(setSpy).toHaveBeenCalledWith([lineItem2, lineItem]);
      });

      it("should not make a change if it's already at the bottom of the tests", async () => {
        const lineItemsService = new LineItemsService();
        const setSpy = jest.spyOn(lineItemsService, 'set');
        await lineItemsService.moveLineItem(lineItem2.id, 'down');
        expect(setSpy).not.toHaveBeenCalled();
      });
    });
  });
});
