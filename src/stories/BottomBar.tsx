import React, {FunctionComponent, PropsWithChildren, ReactElement} from 'react';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';

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
export const BottomBar: FunctionComponent<any> = (props: PropsWithChildren<any>): ReactElement => {
    const classes = useStyles();
    return (
        <Box className={classes.root}>
            {props.children}
        </Box>
    );
};

BottomBar.propTypes = {};
