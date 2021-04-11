import React, {useState} from 'react';
import Box from '@material-ui/core/Box';
import {LineItemsService} from "../service/lineItems.service";
import {Alert} from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";

const lineItemsService = new LineItemsService();

/**
 * Edit line items manually
 */
export const Edit = ({error, /*textFieldValue*/}) => {
    const [state, setState] = useState({
        error,
        textFieldValue: JSON.stringify(lineItemsService.get(), undefined, 4),
    });

    const handleChange = (evt) => {
        const textFieldValue = evt.target.value;

        try {
            const parsed = JSON.parse(textFieldValue);
            if (!hasDuplicateIds(parsed)) {
                lineItemsService.set(parsed);
                setState({error: '', textFieldValue});
            } else {
                setState({error: 'Cannot have duplicate IDs. Did not save', textFieldValue});
            }
        } catch (e) {
            setState({error: 'Issue with JSON below. Did not save', textFieldValue});
        }
    };

    /**
     * Checks if a duplicate ID exists in the array
     * Useful if user manually copy/pastes to create a new line item
     * @param lineItems
     * @return {boolean}
     */
    const hasDuplicateIds = (lineItems) => {
        const ids = lineItems.map(i => i.id);
        return new Set(ids).size !== ids.length
    };

    const reset = () => {
        setState({textFieldValue: JSON.stringify(lineItemsService.get(), undefined, 4), error: false});
    };

    return (
        <Box p={2}>
            <Box mb={1}>
                Manually edit the JSON
            </Box>
            {state.error && <Alert severity="error">{state.error}</Alert>}
            <TextField
                placeholder="JSON value of line items, edit with care"
                multiline
                rows={1}
                fullWidth
                rowsMax={10}
                spellCheck="false"
                value={state.textFieldValue}
                onChange={handleChange}
            />
            <Box mt={2}>
                <Button variant="contained"
                        onClick={reset}
                        color="primary">
                    Reset to last saved state
                </Button>
            </Box>
        </Box>
    );
};

Edit.propTypes = {};

Edit.defaultProps = {
    error: false,
    textFieldValue: [],
};
