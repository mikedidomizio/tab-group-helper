import React, {useState} from 'react';
import Box from '@material-ui/core/Box';

/**
 * Export
 */
export const Export = ({lineItems}) => {
    return (
        <Box p={2}>
            {lineItems}
        </Box>
    );
};

Export.propTypes = {};

Export.defaultProps = {};
