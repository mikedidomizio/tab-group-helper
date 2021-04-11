export const newLineItem = () => {
    return {
        applyChanges: false,
        existing: false,
        id: new Date().getTime(),
        textMatching: "",
    }
};

const storageKey = 'lineItems';

/**
 * Maintains the line items between components
 */
export class LineItemsService {

    #lineItems = this.getFromStorage();

    reset() {
        this.#lineItems = [];
        localStorage.setItem(storageKey, JSON.stringify(this.#lineItems));
    }

    getFromStorage() {
        const lineItems = localStorage.getItem(storageKey);
        if (lineItems) {
            return JSON.parse(lineItems);
        }
        return [];
    }

    get() {
        return this.getFromStorage();
    }

    add() {
        const lineItems = this.get().slice();
        this.#lineItems = lineItems.concat([newLineItem()]);
        localStorage.setItem(storageKey, JSON.stringify(this.#lineItems));
        return this.get();
    }

    set(lineItemsArr) {
        this.#lineItems = lineItemsArr.concat();
        localStorage.setItem(storageKey, JSON.stringify(this.#lineItems));
        return this.get();
    }

    updateLineItems(lineItemUniqueId, lineItemState) {
        let lineItems = this.get().slice();
        this.#lineItems = lineItems.map(i => {
            if (i.id === lineItemUniqueId) {
                i = lineItemState;
            }

            return i;
        });
        localStorage.setItem(storageKey, JSON.stringify(this.#lineItems));
        return this.get();
    }

    deleteLineItems(lineItemUniqueId) {
        const lineItems = this.get().slice();
        // check to see if line item length is 1, if so we just reset it to empty
        if (lineItems.length === 1) {
            this.reset();
        } else {
            this.#lineItems = lineItems.filter((item) => item.id !== lineItemUniqueId);
            // setState({lineItems});
            localStorage.setItem(storageKey, JSON.stringify(this.#lineItems));
        }
        return this.get();
    }

}
