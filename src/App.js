import './App.css';
import React, {useCallback} from 'react';
import {Board} from './stories/pages/Board';
import {makeStyles} from '@material-ui/core/styles';
import {AppBar, IconButton, Menu, MenuItem, Toolbar, Typography} from '@material-ui/core';
import {GitHub, Menu as MenuIcon} from '@material-ui/icons';
import {Edit} from './stories/pages/Edit';
import {createMemoryHistory} from 'history';
import packageJSON from '../package.json';

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

// leave outside the app to continue working
const history = createMemoryHistory();

function App() {
    const chromeVersion = /Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1];
    // necessary for the tabGroups API
    const requiredChromeVersion = 89;

    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenGithubRepoPage = () => {
        chrome.tabs.create({url: packageJSON.repository.url});
    }

    const handleOnMenuItemClick = useCallback((url) => {
        history.push(url);
        handleClose();
    }, []);

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
                            {/*<MenuItem onClick={() => handleOnMenuItemClick('/help')}>*/}
                            {/*    Help*/}
                            {/*</MenuItem>*/}
                        </Menu>

                        <Typography variant="h6" className={classes.title}>
                            {packageJSON.prettyName}
                        </Typography>

                        <Typography variant="h6" className={classes.menuButton}>
                            {packageJSON.version}
                        </Typography>
                        <IconButton edge="start" color="inherit" aria-label="github"
                                    onClick={handleOpenGithubRepoPage}
                        >
                            <GitHub/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                {history.location.pathname === '/edit' && <Edit/>}
                {history.location.pathname === '/' && <Board/>}
            </div>
            }

            {!correctChromeVersion() &&
            `Requires at least Chrome version ${requiredChromeVersion} to function properly`
            }
        </div>
    );
}

export default App;
