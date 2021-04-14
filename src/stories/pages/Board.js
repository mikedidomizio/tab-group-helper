import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import {LineItem} from "../LineItem";
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import {TabService} from "../../service/tab.service";
import {LineItemsService, newLineItem} from "../../service/lineItems.service";
import {makeStyles} from "@material-ui/core/styles";
import {BottomBar} from "../BottomBar";

const useStyles = makeStyles((theme) => ({
    root: {
        // was just manually tested in Chrome, no fancy calculations
        height: '536px',
        '& .MuiFormGroup-root:not(:last-child)': {
            marginBottom: theme.spacing(2)
        },
        '& .lineItemsHolder': {
            // this is just to offset the header and keep the sticky to the bottom if not enough items are added
            minHeight: '468px',
            height: '468px',
            overflowY: 'scroll'
        }
    }
}));

/**
 * Board of line items that we will run against to group Chrome tabs
 */
export const Board = (/*{lineItems}*/) => {
    const classes = useStyles();
    const lineItemsService = new LineItemsService();
    const [state, setState] = useState({
        lineItems: lineItemsService.get(),
    });
    const tabsService = new TabService();

    /**
     * Proceed to run grouping
     */
    const run = async () => {
        let lineItems = lineItemsService.get();
        // immediately filter where apply is true, we ignore otherwise
        // todo work with other options
        lineItems = lineItems.filter(i => i.applyChanges);

        for (let item of lineItems) {
            const regex = item.matchType.toLowerCase().includes("regex");
            const matchTitle = item.matchType.includes("title") ? "title" : "url";
            const returned = await new TabService().getTabsWhichMatch(item.text, matchTitle, regex);
            const ids = returned.map(i => i.id);
            if (ids) {
                const color = item.color !== "" ? item.color : undefined;
                await tabsService.addTabsToGroup(ids, item.groupTitle, color);
            }
        }
    };

    // proceeds to remove any line items that match the default (aka have not been edited)
    const cleanUp = () => {
        const defaultLineItem = newLineItem();
        // delete ID because it's always different
        //delete defaultLineItem.id;
        const sortObjectByKeys = (objToSort) => {
            return Object.keys(objToSort).sort().reduce(
                (obj, key) => {
                    obj[key] = objToSort[key];
                    return obj;
                },
                {}
            )
        };
        const sortedStringifiedDefaultLineItem = sortObjectByKeys(defaultLineItem);

        const cleanedUpLineItems = state.lineItems.slice().filter(item => {
            const sortedClonedLineItem = sortObjectByKeys(item);
            // rename the id, deleting it leads to deleting it in the returned object
            sortedStringifiedDefaultLineItem.id = item.id;
            // we sorted both and then stringify to ensure keys are all alphabetical
            // this is only going to work for shallow objects
            return JSON.stringify(sortedClonedLineItem) !== JSON.stringify(sortedStringifiedDefaultLineItem);
        });

        if (cleanedUpLineItems.length) {
            setState({lineItems: lineItemsService.set(cleanedUpLineItems)});
        } else {
            lineItemsService.reset();
            setState({lineItems: lineItemsService.add()});
        }
    };

    /**
     * Removes all current groups
     */
    const clearGroups = async () => {
        await tabsService.clearGroups();
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
        <Box className={classes.root}>
            <Box className="lineItemsHolder">
                {state.lineItems.map((data, idx) => (
                    <Box key={data.id}>
                        <Box p={2} className="line-item">
                            <LineItem onLineItemChange={(d) => handleLineItemChange(data.id, d)}
                                      deleteLineItem={deleteLineItem} {...data}/>

                        </Box>
                        {state.lineItems.length - 1 !== idx && <Divider light/>}
                    </Box>
                ))}
            </Box>
            <BottomBar>
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
                {/*<Box component="span" ml={1}>
                    <Button ml={1} variant="contained" onClick={cleanUp} color="primary">
                        Clean up
                    </Button>
                </Box>
                <Box component="span" ml={1}>
                    <Button ml={1} variant="contained" onClick={clearGroups} color="primary">
                        Clear Groups
                    </Button>
                </Box>*/}
            </BottomBar>
        </Box>
    );
};

Board.propTypes = {
    /**
     * Array of line items to possibly apply grouping changes
     */
    lineItems: PropTypes.arrayOf(PropTypes.exact({
        applyChanges: PropTypes.bool,
        color: PropTypes.string,
        id: PropTypes.number,
        groupTitle: PropTypes.string,
        matchType: PropTypes.string,
        text: PropTypes.string
    }))
};

Board.defaultProps = {
    lineItems: [],
};
