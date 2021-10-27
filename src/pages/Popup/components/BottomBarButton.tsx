import {
  Box,
  Button,
  PropTypes,
  Tooltip,
  TooltipProps,
} from '@material-ui/core';
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

interface BottomBarButtonProps {
  /**
   * Color of the button which will default to primary if not specified
   */
  color?: PropTypes.Color;
  /**
   * The contents of the button
   */
  children: string;
  /**
   * An icon for the end of the button
   */
  endIcon?: JSX.Element | null;
  /**
   * The click functionality set by the parent.  By default no action occurs.
   */
  onClick: any;
  /**
   * The placement of the tooltip.  Values can be retrieved from https://material-ui.com/api/tooltip/
   */
  placement?: TooltipProps['placement'];
  /**
   * The tooltip text that appears on hovering
   */
  tooltip: string | boolean;
}

const defaultProps: BottomBarButtonProps = {
  children: '',
  color: 'primary',
  endIcon: null,
  onClick: () => {},
  placement: 'top-start',
  tooltip: false,
};

/**
 * Buttons used in bottom bar with tool tip functionality.
 * Difference between this and normal button is this has removed drop shadow.
 * Simplifies everything into a one line component.
 */
export const BottomBarButton: FunctionComponent<BottomBarButtonProps> = ({
  children,
  color,
  endIcon,
  onClick,
  placement,
  tooltip,
}: PropsWithChildren<BottomBarButtonProps>): ReactElement => {
  const classes = useStyles();
  return (
    <Box className={classes.root} component="span" mr={1}>
      <Tooltip
        title={tooltip}
        enterDelay={1000}
        placement={placement}
        leaveDelay={0}
      >
        <Button
          onClick={onClick}
          variant="contained"
          color={color}
          endIcon={endIcon}
        >
          {children}
        </Button>
      </Tooltip>
    </Box>
  );
};

BottomBarButton.defaultProps = defaultProps;
