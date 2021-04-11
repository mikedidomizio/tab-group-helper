import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import {LineItem} from "./LineItem";
import Box from '@material-ui/core/Box';
import {TabService} from "../service/tab.service";

export const newLineItem = () => {
    return {
        applyChanges: false,
        existing: false,
        id: new Date().getTime(),
        textMatching: "",
    }
};

/**
 * Board of line items that we will run against to group Chrome tabs
 */
export const Board = ({lineItems}) => {
    const [state, setState] = useState({
        lineItems,
    });

    /**
     * Proceed to run grouping
     */
    const run = async () => {
        let lineItems = state.lineItems.slice();
        // immediately filter where apply is true, we ignore otherwise
        // lineItems = lineItems.filter(i => i.applyChanges);


        const returned = await new TabService().getTabsWhereUrlContains('chrome');
        console.log('adding tab', returned[0], 'to group');
        await new TabService().addTabsToGroup([returned[0].id], "test group");
    };

    const addLineItem = () => {
        let lineItems = state.lineItems.slice();
        setState({
            lineItems: lineItems.concat([newLineItem()])
        })
    };

    const deleteLineItem = (lineItemUniqueId) => {
        let lineItems = state.lineItems.slice();
        // check to see if line item length is 1, if so we just reset it to empty
        if (lineItems.length === 1) {
            setState({lineItems: [newLineItem()]});
        } else {
            lineItems = lineItems.filter((item) => item.id !== lineItemUniqueId);
            setState({lineItems});
        }
    };

    const handleLineItemChange = (lineItemUniqueId, lineItemState) => {
        let lineItems = state.lineItems.slice();
        lineItems = lineItems.map(i => {
            if (i.id === lineItemUniqueId) {
                i = lineItemState;
            }

            return i;
        });
        // update the state of lineItems
        setState({lineItems});
    };

    return (
        <div>
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
        </div>
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
    lineItems: [newLineItem()],
};
