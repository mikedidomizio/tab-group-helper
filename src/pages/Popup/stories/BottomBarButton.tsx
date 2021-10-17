import { Box, Button, Tooltip, TooltipProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
} from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    '& button': {
      boxShadow: 'none !important',
    },
  },
}));

interface BottomBarButtonInterface {
  /**
   * The contents of the button
   */
  children: string;
  /**
   * The click functionality set by the parent.  By default no action occurs.
   */
  onClick: Function;
  /**
   * The placement of the tooltip.  Values can be retrieved from https://material-ui.com/api/tooltip/
   */
  placement?: TooltipProps['placement'];
  /**
   * The tooltip text that appears on hovering
   */
  tooltip?: string;
}

const defaultProps: BottomBarButtonInterface = {
  children: '',
  onClick: () => {},
  placement: 'top-start',
  tooltip: '',
};

/**
 * Buttons used in bottom bar with tool tip functionality.
 * Difference between this and normal button is this has removed drop shadow.
 * Simplifies everything into a one line component.
 */
export const BottomBarButton: FunctionComponent<BottomBarButtonInterface> = (
  props: PropsWithChildren<any>
): ReactElement => {
  const classes = useStyles();
  return (
    <Box className={classes.root} component="span" mr={1}>
      <Tooltip
        title={props.tooltip}
        enterDelay={1000}
        placement={props.placement}
        leaveDelay={0}
      >
        <Button onClick={props.onClick} variant="contained" color="primary">
          {props.children}
        </Button>
      </Tooltip>
    </Box>
  );
};

BottomBarButton.defaultProps = defaultProps;
