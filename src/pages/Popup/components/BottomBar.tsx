import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
} from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'sticky',
    bottom: '0px',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}));

/**
 * Bottom style navigation bar
 */
export const BottomBar: FunctionComponent<any> = (
  props: PropsWithChildren<any>
): ReactElement => {
  const classes = useStyles();
  return <Box className={classes.root}>{props.children}</Box>;
};

BottomBar.propTypes = {};
