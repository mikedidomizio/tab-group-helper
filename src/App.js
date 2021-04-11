import './App.css';
import {Board} from "./stories/pages/Board";
import React, {useCallback} from "react";
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import MenuIcon from '@material-ui/icons/Menu';
import {Route, Switch, useHistory} from "react-router-dom";
import {Edit} from "./stories/pages/Edit";

const chromeVersion = /Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1];
// necessary for the tabGroups API
const requiredChromeVersion = 89;

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        '& .MuiAppBar-root': {
            position: 'sticky',
            top: '0px'
        }
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

function App() {
    const classes = useStyles();
    const history = useHistory();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOnMenuItemClick = useCallback((url) => {
        history.push(url);
        handleClose();
    }, [history]);

    const correctChromeVersion = () => parseInt(chromeVersion) >= requiredChromeVersion;

    return (
        <div className="App">
            {correctChromeVersion &&
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
                                    onClick={handleOpen}>
                            <MenuIcon/>
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
                        </Menu>

                        <Typography variant="h6" className={classes.title}>
                            Chrome Tab Group Helper
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Switch>
                    <Route path="/edit">
                        <Edit/>
                    </Route>
                    <Route path="/">
                        <Board/>
                    </Route>
                </Switch>
            </div>
            }

            {!correctChromeVersion() &&
            `Requires at least Chrome version ${requiredChromeVersion} to function properly`
            }
        </div>
    );
}

export default App;
