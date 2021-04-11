import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

/**
 * Line item for grouping Chrome tabs
 */
export const LineItem = ({applyChanges, deleteLineItem, existing, id, onLineItemChange, textMatching}) => {
    const handleChange = (event) => {
        onLineItemChange(Object.assign({
            applyChanges,
            existing,
            id,
            textMatching
        }, {[event.target.name]: event.target.checked}));
    };

    const handleTextChange = (event) => {
        onLineItemChange(Object.assign({
            applyChanges,
            existing,
            id,
            textMatching
        }, {[event.target.name]: event.target.value}));
    };

    const handleDelete = () => {
        deleteLineItem(id);
    };

    return (
        <FormGroup row>
            <TextField required name="textMatching"
                       onChange={handleTextChange}
                       label="URL includes"
                       value={textMatching}
            />
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
                        name="existing"
                        color="primary"
                    />
                }
                label="Change Existing?"
            />
            <IconButton aria-label="delete" onClick={handleDelete}>
                <DeleteIcon/>
            </IconButton>
        </FormGroup>
    );
};

LineItem.propTypes = {
    /**
     * Whether the changes should be applied the next time we group
     */
    applyChanges: PropTypes.bool,
    /**
     * To apply changes to already grouped tabs
     */
    existing: PropTypes.bool,
    /**
     * What text to match (accepts strings with wildcards and will support regex in the future)
     */
    textMatching: PropTypes.string
};

LineItem.defaultProps = {
    applyChanges: false,
    existing: false,
    textMatching: "",
};
