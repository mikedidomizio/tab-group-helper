import React from 'react';
import Box from '@material-ui/core/Box';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Accordion, AccordionDetails, AccordionSummary, makeStyles, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));

/**
 * Help page
 */
export const Help = () => {
    const classes = useStyles();

    return (
        <Box p={2}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography className={classes.heading}>How do I use this?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        To keep documentation always in sync with what the extension offers, the GitHub page for this extension will be the best place for reading.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography className={classes.heading}>Tips</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

Help.propTypes = {};

Help.defaultProps = {};
