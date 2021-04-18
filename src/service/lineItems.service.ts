/// <reference types="@types/chrome" />

export enum ChromeTabsAttributes {
    title = 'title',
    url = 'url'
}

export interface LineItem {
    applyChanges: boolean,
    caseSensitive: boolean,
    color?: chrome.tabGroups.ColorEnum,
    id: number,
    groupTitle: string,
    matchType: ChromeTabsAttributes,
    regex: boolean,
    text: string;
}

export const newLineItem = (): LineItem => {
    return Object.seal({
        applyChanges: true,
        caseSensitive: false,
        color: undefined,
        id: new Date().getTime(),
        groupTitle: '',
        matchType: ChromeTabsAttributes.url,
        regex: false,
        text: '',
    })
};

const storageKey = 'lineItems';

/**
 * Maintains the line items between components
 */
export class LineItemsService {

    lineItems: LineItem[] = this.getFromStorage();

    constructor() {
        if (this.get().length === 0) {
            this.add();
        }
    }

    reset(): LineItem[] {
        this.lineItems = [];
        localStorage.setItem(storageKey, JSON.stringify(this.lineItems));
        return this.get();
    }

    getFromStorage(): LineItem[] {
        const lineItems = localStorage.getItem(storageKey);
        if (lineItems) {
            return JSON.parse(lineItems);
        }
        return this.reset();
    }

    get(): LineItem[] {
        return this.getFromStorage();
    }

    add(): LineItem[] {
        const lineItems = this.get().slice();
        this.lineItems = lineItems.concat([newLineItem()]);
        localStorage.setItem(storageKey, JSON.stringify(this.lineItems));
        return this.get();
    }

    set(lineItemsArr: any[]): LineItem[] {
        this.lineItems = lineItemsArr.concat();
        localStorage.setItem(storageKey, JSON.stringify(this.lineItems));
        return this.get();
    }

    updateLineItems(lineItemUniqueId: number, lineItemState: any): LineItem[] {
        let lineItems = this.get().slice();
        this.lineItems = lineItems.map(i => {
            if (i.id === lineItemUniqueId) {
                i = lineItemState;
            }

            return i;
        });
        localStorage.setItem(storageKey, JSON.stringify(this.lineItems));
        return this.get();
    }

    deleteLineItems(lineItemUniqueId: number): LineItem[] {
        const lineItems = this.get().slice();
        // check to see if line item length is 1, if so we just reset it to empty
        if (lineItems.length === 1) {
            this.reset();
        } else {
            this.lineItems = lineItems.filter((item) => item.id !== lineItemUniqueId);
            // setState({lineItems});
            localStorage.setItem(storageKey, JSON.stringify(this.lineItems));
        }
        return this.get();
    }

}
