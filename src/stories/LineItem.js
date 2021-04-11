import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import {makeStyles} from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            width: '25ch',
        },
        '& > div:not(:first-child), & > label:not(:first-child)': {
            'margin-left': '20px',
            marginRight: theme.spacing(1),
        }
    },
}));

/**
 * Line item for grouping Chrome tabs
 */
export const LineItem = ({applyChanges, color, deleteLineItem, existing, id, groupTitle, onLineItemChange, textMatching}) => {
    const classes = useStyles();
    const colorOptions = ['', 'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'];

    const menuOptions = () => {
        return colorOptions.map(i => {
            const label = i === '' ? 'color' : i;
            return (
                <MenuItem key={i} value={i}>{label}</MenuItem>
            )
        });
    };

    const handleChange = (event) => {
        onLineItemChange(Object.assign({
            applyChanges,
            color,
            existing,
            id,
            groupTitle,
            textMatching
        }, {[event.target.name]: event.target.checked}));
    };

    const handleTextChange = (event) => {
        onLineItemChange(Object.assign({
            applyChanges,
            color,
            existing,
            id,
            groupTitle,
            textMatching
        }, {[event.target.name]: event.target.value}));
    };

    const handleDelete = () => {
        deleteLineItem(id);
    };

    return (
        <div>
            <FormGroup className={classes.root} row>
                <TextField required name="textMatching"
                           onChange={handleTextChange}
                           label="URL includes"
                           autoComplete="false"
                           spellCheck="false"
                           value={textMatching}
                />
                <TextField required name="groupTitle"
                           onChange={handleTextChange}
                           label="Group Title"
                           autoComplete="false"
                           spellCheck="false"
                           value={groupTitle}
                />
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
                <IconButton aria-label="delete" onClick={handleDelete}>
                    <DeleteIcon/>
                </IconButton>
            </FormGroup>
            <FormGroup className={classes.root} row>
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
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={existing}
                            onChange={handleChange}
                            label="Change existing?"
                            name="existing"
                            color="primary"
                        />
                    }
                    label="Change Existing?"
                />
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
     * To apply changes to already grouped tabs
     */
    existing: PropTypes.bool,
    /**
     * Group title to create/update
     */
    groupTitle: PropTypes.string,
    /**
     * What text to match (accepts strings with wildcards and will support regex in the future)
     */
    textMatching: PropTypes.string
};

LineItem.defaultProps = {
    applyChanges: false,
    color: "",
    existing: false,
    groupTitle: "",
    textMatching: "",
};
