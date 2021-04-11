import './App.css';
import {Board} from "./stories/Board";
import React, {useCallback} from "react";
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {Route, Switch, useHistory} from "react-router-dom";
import {Edit} from "./stories/Edit";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
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
        history.push(url)
        handleClose();
    }, [history]);

    return (
        <div className="App">

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
                            Chrome Auto Grouping
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
            <Switch>
                <Route path="/edit">
                    <Edit/>
                </Route>
                <Route path="/">
                    <Board/>
                </Route>
            </Switch>
        </div>
    );
}

export default App;
