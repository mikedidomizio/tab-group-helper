import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import {LineItem} from "./LineItem";
import Box from '@material-ui/core/Box';
import {TabService} from "../service/tab.service";
import {LineItemsService} from "../service/lineItems.service";

/**
 * Board of line items that we will run against to group Chrome tabs
 */
export const Board = (/*{lineItems}*/) => {
    const lineItemsService = new LineItemsService();
    const [state, setState] = useState({
        lineItems: lineItemsService.get(),
    });

    /**
     * Proceed to run grouping
     */
    const run = async () => {
        let lineItems = lineItemsService.get();
        // immediately filter where apply is true, we ignore otherwise
        // lineItems = lineItems.filter(i => i.applyChanges);
        const returned = await new TabService().getTabsWhereUrlContains('chrome');
        console.log('adding tab', returned[0], 'to group');
        await new TabService().addTabsToGroup([returned[0].id], "test group");
    };

    const addLineItem = () => {
        setState({lineItems: lineItemsService.add()});
    };

    const deleteLineItem = (lineItemUniqueId) => {
        if (lineItemsService.get().length === 1) {
            lineItemsService.reset();
            setState({lineItems: lineItemsService.add()});
        } else {
            setState({lineItems: lineItemsService.deleteLineItems(lineItemUniqueId)});
        }
    };

    const handleLineItemChange = (lineItemUniqueId, lineItemState) => {
        setState({lineItems: lineItemsService.updateLineItems(lineItemUniqueId, lineItemState)});
    };

    return (
        <Box p={2}>
            {state.lineItems.map((data) => (
                <Box mb={2} key={data.id}>
                    <LineItem onLineItemChange={(d) => handleLineItemChange(data.id, d)}
                              deleteLineItem={deleteLineItem} {...data}/>
                </Box>
            ))}
            <Box mt={2}>
                <Button variant="contained"
                        onClick={addLineItem}
                        color="primary">
                    Add Item
                </Button>
                <Box component="span" ml={1}>
                    <Button ml={1} variant="contained" onClick={run} color="primary">
                        Run
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

Board.propTypes = {
    /**
     * Array of line items to possibly apply grouping changes
     */
    lineItems: PropTypes.arrayOf(PropTypes.exact({
        applyChanges: PropTypes.bool,
        existing: PropTypes.bool,
        id: PropTypes.number,
        textMatching: PropTypes.string
    }))
};

Board.defaultProps = {
    lineItems: [],
};
