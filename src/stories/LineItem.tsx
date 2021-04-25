import React, {ChangeEvent, FunctionComponent, ReactElement, SetStateAction, useEffect, useState} from 'react';
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
            width: '60px'
        },
        '& .MuiFormGroup-root:not(:last-child)': {
            marginBottom: theme.spacing(2)
        },
        '& .MuiFormControl-root': {
            marginRight: theme.spacing(1),
        }
    },
}));

export interface LineItemProps extends LItem {
    /**
     * Calls parent to delete remove
     */
    deleteLineItem: (args: number) => void;
    /**
     * On prop change, it calls the parent component
     */
    onLineItemChange: (args: LItem) => void;
}

const defaultProps: LItem = {
    applyChanges: true,
    caseSensitive: false,
    color: '',
    groupTitle: '',
    id: -1,
    matchType: ChromeTabsAttributes.url,
    regex: true,
    text: '',
}

/**
 * Line item for grouping Chrome tabs
 */
export const LineItem: FunctionComponent<LineItemProps> = ({
                                                               applyChanges,
                                                               caseSensitive,
                                                               color,
                                                               deleteLineItem,
                                                               id,
                                                               groupTitle,
                                                               matchType,
                                                               onLineItemChange,
                                                               regex,
                                                               text
                                                           }: LineItemProps & typeof defaultProps): ReactElement => {
    const classes = useStyles();
    const colorOptions: Array<chrome.tabGroups.ColorEnum | ''> = ['', 'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'];
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

    /**
     * @param event
     * @param targetType which value to assign, which is different between text fields and checkboxes
     */
    const handleChange = (event: ChangeEvent<any>, targetType: 'value' | 'checked') => {
        onLineItemChange(Object.assign(getLineItemValues(), {[event.target.name]: event.target[targetType]}));
    };

    return (
        <div className={classes.root}>
            <FormGroup row>
                <FormControl>
                    <InputLabel id="matchType">Type</InputLabel>
                    <Select
                        labelId="Match Type"
                        id="matchType"
                        label="Match Type"
                        name="matchType"
                        onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'value')}
                        value={matchType}
                    >
                        <MenuItem key="title" value="title">Title</MenuItem>
                        <MenuItem key="url" value="url">URL</MenuItem>
                    </Select>
                </FormControl>

                <TextField required name="text"
                           onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'value')}
                           label="Contains"
                           autoComplete="off"
                           spellCheck="false"
                           value={text}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={caseSensitive}
                            onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'checked')}
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
                            onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'checked')}
                            name="regex"
                            color="primary"
                        />
                    }
                    label="Regex"
                />
            </FormGroup>
            <FormGroup className={classes.root} row>
                <TextField required name="groupTitle"
                           onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'value')}
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
                            onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'value')}
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
                            onChange={(evt: ChangeEvent<any>) => handleChange(evt, 'checked')}
                            name="applyChanges"
                            color="primary"
                        />
                    }
                    label="Apply"
                />
                <IconButton aria-label="delete" onClick={() => deleteLineItem(id)}>
                    <DeleteIcon/>
                </IconButton>


            </FormGroup>
            <FormGroup className={classes.root} row>
                <Tooltip title={getTabsMatched()} placement="bottom-start">
                    <InputLabel>{`${stateTabsMatched.length} match`}{stateTabsMatched.length !== 1 && 'es'}</InputLabel>
                </Tooltip>
            </FormGroup>
        </div>
    );
};

LineItem.defaultProps = defaultProps;
