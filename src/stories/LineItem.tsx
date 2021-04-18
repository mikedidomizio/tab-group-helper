import React, {ChangeEvent, SetStateAction, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import {makeStyles} from '@material-ui/core/styles';
import {TabService} from '../service/tab.service';
import {ChromeTabsAttributes, LineItem as LItem} from '../service/lineItems.service';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {},
        '& .MuiSelect-root': {
            width: '100px'
        },
        '& > div:not(:first-child), & > label:not(:first-child)': {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        // todo needed?
        '& > .tabsMatched': {
            // 132px should be able to handle 100 tabs matched!
            width: '132px;',
            '& label': {
                // this is to get the text to visually align with the next line checkbox
                paddingLeft: theme.spacing(1),
            }
        }
    },
}));

interface LineItemProps extends LItem {
    deleteLineItem: Function;
    onLineItemChange: Function;
}

/**
 * Line item for grouping Chrome tabs
 */
export const LineItem = ({applyChanges, caseSensitive, color, deleteLineItem, id, groupTitle, matchType, onLineItemChange, regex, text}: LineItemProps) => {
    const classes = useStyles();
    const colorOptions = ['', 'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'];
    const [stateTabsMatched, setTabsMatchedState]: [chrome.tabs.Tab[], SetStateAction<any>] = useState([]);

    const menuOptions = () => {
        return colorOptions.map(i => {
            const label = i === '' ? 'none' : i;
            return (
                <MenuItem key={i} value={i}>{label}</MenuItem>
            )
        });
    };

    const getTabsMatched = () => {
        if (stateTabsMatched.length === 0) {
            return (
                <div>No matches</div>
            )
        }

        return stateTabsMatched.map((i: chrome.tabs.Tab) => {
            const val = (i as any)[matchType];
            return (
                <Box mb={1} key={i.id}>{val}</Box>
            )
        });
    };

    const checkMatches = async () => {
        // take the values and update the state/dom to show how many tabs are matched
        const tabsMatched = await new TabService().getTabsWhichMatch(text, matchType, caseSensitive, regex);
        if (tabsMatched.length !== stateTabsMatched.length) {
            setTabsMatchedState(tabsMatched);
        }
    };

    (async () => checkMatches())();
    // @ts-ignore
    useEffect(() => async () => await checkMatches(), [stateTabsMatched]); // eslint-disable-line react-hooks/exhaustive-deps

    const getLineItemValues = (): LItem => {
        return {
            applyChanges,
            caseSensitive,
            color,
            id,
            groupTitle,
            matchType,
            regex,
            text
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onLineItemChange(Object.assign(getLineItemValues(), {[event.target.name]: event.target.checked}));
    };

    const handleTextChange = (event: ChangeEvent<any>) => {
        onLineItemChange(Object.assign(getLineItemValues(), {[event.target.name]: event.target.value}));
    };

    const handleDelete = () => {
        deleteLineItem(id);
    };

    return (
        <div className={color}>
            <FormGroup className={classes.root} row>
                <FormControl>
                    <InputLabel id="matchType">Type</InputLabel>
                    <Select
                        labelId="Match Type"
                        id="matchType"
                        label="Match Type"
                        name="matchType"
                        onChange={handleTextChange}
                        value={matchType}
                    >
                        <MenuItem key="title" value="title">Title</MenuItem>
                        <MenuItem key="url" value="url">URL</MenuItem>
                    </Select>
                </FormControl>

                <TextField required name="text"
                           onChange={handleTextChange}
                           label="Contains"
                           autoComplete="off"
                           spellCheck="false"
                           value={text}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={caseSensitive}
                            onChange={handleChange}
                            name="caseSensitive"
                            color="primary"
                        />
                    }
                    label="Case Sensitive"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={regex}
                            onChange={handleChange}
                            name="regex"
                            color="primary"
                        />
                    }
                    label="Regex"
                />
            </FormGroup>
            <FormGroup className={classes.root} row>
                <TextField required name="groupTitle"
                           onChange={handleTextChange}
                           label="Group Name"
                           autoComplete="off"
                           spellCheck="false"
                           value={groupTitle}
                />
                <FormGroup className={classes.root} row>
                    <FormControl>
                        <InputLabel id="color">Color</InputLabel>
                        <Select
                            labelId="color"
                            id="color"
                            label="Color"
                            name="color"
                            onChange={handleTextChange}
                            value={color}
                        >
                            {menuOptions()}
                        </Select>
                    </FormControl>
                </FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={applyChanges}
                            onChange={handleChange}
                            name="applyChanges"
                            color="primary"
                        />
                    }
                    label="Apply"
                />
                <IconButton aria-label="delete" onClick={handleDelete}>
                    <DeleteIcon/>
                </IconButton>


            </FormGroup>
            <FormGroup className={classes.root} row>
                <Tooltip title={getTabsMatched()} placement="bottom-end">

                    <InputLabel>{`${stateTabsMatched.length} match`}{stateTabsMatched.length !== 1 && 'es'}</InputLabel>
                </Tooltip>
            </FormGroup>
        </div>
    );
};

LineItem.propTypes = {
    /**
     * Whether the changes should be applied the next time we group
     */
    applyChanges: PropTypes.bool,
    /**
     * The color to apply to the group
     */
    color: PropTypes.string,
    /**
     * Group title to create/update
     */
    groupTitle: PropTypes.string,
    /**
     * What the rule should match
     */
    matchType: PropTypes.string,
    /**
     * What text to match (accepts strings with wildcards and will support regex in the future)
     */
    text: PropTypes.string
};

LineItem.defaultProps = {
    applyChanges: false,
    color: '',
    groupTitle: '',
    matchType: ChromeTabsAttributes.url,
    text: '',
};
