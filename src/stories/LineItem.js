import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import {makeStyles} from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {TabService} from "../service/tab.service";

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            // width: '25ch',
            // marginTop: '10px',
        },
        '& .MuiSelect-root': {
            width: '100px'
        },
        '& > div:not(:first-child), & > label:not(:first-child)': {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        }
    },
}));

/**
 * Line item for grouping Chrome tabs
 */
export const LineItem = ({applyChanges, color, deleteLineItem, id, groupTitle, matchType, onLineItemChange, text}) => {
    const classes = useStyles();
    const colorOptions = ['', 'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'];
    const [stateTabsMatched, setTabsMatchedState] = useState(0);

    const menuOptions = () => {
        return colorOptions.map(i => {
            const label = i === '' ? 'none' : i;
            return (
                <MenuItem key={i} value={i}>{label}</MenuItem>
            )
        });
    };

    const checkMatches = async() => {
        // todo a bit of duplication going on here with the board component
        const regex = matchType.toLowerCase().includes("regex");
        const matchTitle = matchType.includes("title") ? "title" : "url";
        // take the values and update the state/dom to show how many tabs are matched
        const tabsMatched = await new TabService().getTabsWhichMatch(text, matchTitle, regex);
        if (tabsMatched.length !== setTabsMatchedState.length) {
            setTabsMatchedState(tabsMatched.length);
        }
    }

    (async () => checkMatches())();

    useEffect(() => {
        (async() => checkMatches())()
    }, [stateTabsMatched]);

    const handleChange = (event) => {
        onLineItemChange(Object.assign({
            applyChanges,
            color,
            id,
            groupTitle,
            matchType,
            text
        }, {[event.target.name]: event.target.checked}));
    };

    const handleTextChange = (event) => {
        onLineItemChange(Object.assign({
            applyChanges,
            color,
            id,
            groupTitle,
            matchType,
            text
        }, {[event.target.name]: event.target.value}));
    };

    const handleDelete = () => {
        deleteLineItem(id);
    };

    return (
        <div>
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
                        <MenuItem key="titleRegex" value="titleRegex">Title regex</MenuItem>
                        <MenuItem key="urlRegex" value="urlRegex">URL regex</MenuItem>
                    </Select>
                </FormControl>

                <TextField required name="text"
                           onChange={handleTextChange}
                           label="Contains"
                           autoComplete="new-password"
                           spellCheck="false"
                           value={text}
                />
            </FormGroup>
            <FormGroup className={classes.root} row>
                <TextField required name="groupTitle"
                           onChange={handleTextChange}
                           label="Group Name"
                           autoComplete="new-password"
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
                {`${stateTabsMatched} tabs matched`}
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
    color: "",
    groupTitle: "",
    matchType: "url",
    text: "",
};
