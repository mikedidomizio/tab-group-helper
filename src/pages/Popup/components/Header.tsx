import React, {
  FunctionComponent,
  ReactElement, useCallback, useState,
} from 'react';
import clsx from 'clsx';
import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import packageJSON from '../../../../package.json';
import { useStylesButtons } from './BottomBarButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    '& .MuiAppBar-root': {
      position: 'sticky',
      top: '0px',
    },
  },
  button: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

/**
 * Header Bar
 */
export const Header: FunctionComponent<{ onMenuItemClick: (url: string) => void }> = ({
                                                                                        onMenuItemClick
                                                                                      }): ReactElement => {
  const classes = useStyles();
  const classesButtons = useStylesButtons();
  const mergedClasses = clsx(classesButtons, classes);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleOnMenuItemClick = (url: string) => {
    onMenuItemClick(url);
    handleClose();
  };

  return <AppBar className={mergedClasses} position="static">
    <Toolbar>
      <IconButton
        edge="start"
        className={[classesButtons.button, classes.button].join(' ')}
        color="inherit"
        aria-label="menu"
        onClick={handleOpen}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleOnMenuItemClick('/')}>
          Home
        </MenuItem>
        <MenuItem onClick={() => handleOnMenuItemClick('/edit')}>
          Manually Edit
        </MenuItem>
        <MenuItem onClick={() => handleOnMenuItemClick('/help')}>
          Help
        </MenuItem>
      </Menu>

      <Typography variant="h6" className={classes.title}>
        {packageJSON.prettyName}
      </Typography>
    </Toolbar>
  </AppBar>
};
