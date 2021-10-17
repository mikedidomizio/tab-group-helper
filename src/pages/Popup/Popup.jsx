import packageJSON from '../../../package.json';
import './App.css';
import { LineItemsService } from './service/lineItems.service';
import { Board } from './stories/pages/Board';
import { Edit } from './stories/pages/Edit';
import { Help } from './stories/pages/Help';
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Menu as MenuIcon } from '@material-ui/icons';
import { createMemoryHistory } from 'history';
import { useCallback, useEffect, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    '& .MuiAppBar-root': {
      position: 'sticky',
      top: '0px',
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

// leave outside the app to continue working
const history = createMemoryHistory();

export const App = () => {
  const chromeVersion = /Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1];
  // necessary for the tabGroups API
  const requiredChromeVersion = 89;

  useEffect(() => {
    (async () => {
      // this is a backwards compatibility workaround (hack) to move localStorage to sessionStorage so line items aren't removed
      // this can probably be removed in a few months
      const storageKey = 'lineItems';
      const lineItemsFromLocalStorage = localStorage.getItem(storageKey);
      if (lineItemsFromLocalStorage) {
        const items = JSON.parse(lineItemsFromLocalStorage);
        const lineItemsService = new LineItemsService();
        const lineItems = await lineItemsService.get();

        // it's safe to say the session storage has never been set, therefore we will set it from localStorage
        if (lineItems[0].text === '' && lineItems[0].groupTitle === '') {
          await lineItemsService.set(items);
          localStorage.removeItem(storageKey);
        }
      }
    })();

    return () => {
      // unmount
    };
  }, []);

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleOnMenuItemClick = useCallback((url) => {
    history.push(url);
    handleClose();
  }, []);

  const correctChromeVersion = () =>
    parseInt(chromeVersion) >= requiredChromeVersion;

  return (
    <div className="App">
      {correctChromeVersion && (
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                className={classes.menuButton}
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
          {history.location.pathname === '/edit' && <Edit />}
          {history.location.pathname === '/help' && <Help />}
          {history.location.pathname === '/' && <Board />}
        </div>
      )}

      {!correctChromeVersion() &&
        `Requires at least Chrome version ${requiredChromeVersion} to function properly`}
    </div>
  );
};
