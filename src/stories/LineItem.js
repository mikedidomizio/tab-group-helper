import React, {useState} from 'react';
import PropTypes from 'prop-types';
import './button.css';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';

/**
 * Line item for grouping Chrome tabs
 */
export const LineItem = ({applyChanges, existing, textMatching}) => {
    const [state, setState] = useState({
        applyChanges,
        existing,
        textMatching,
    });

    return (
        <FormGroup row>
            <TextField required id="standard-basic" name="textMatching"
                       onChange={() => setState({...state, textMatching: state.textMatching})} value={textMatching}
                       label="Text Matching"/>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={existing}
                        onChange={() => setState({...state, existing: state.existing})}
                        name="existing"
                        color="primary"
                    />
                }
                label="Change Existing?"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={applyChanges}
                        onChange={() => setState({...state, applyChanges: state.applyChanges})}
                        name="applyChanges"
                        color="primary"
                    />
                }
                label="Apply"
            />
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
