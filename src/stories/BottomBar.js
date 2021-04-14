import React from 'react';
import './button.css';
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'sticky',
        bottom: '0px',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,

        '& button': {
            boxShadow: 'none !important',
        }
    }
}));

/**
 * Bottom style navigation bar
 */
export const BottomBar = (props) => {
    const classes = useStyles();
    return (
        <Box className={classes.root}>
           {props.children}
        </Box>
    );
};

BottomBar.propTypes = {};

Button.defaultProps = {};
