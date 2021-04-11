import './App.css';
import {Board} from "./stories/Board";
import React from "react";
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

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
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExport = () => {
        // todo need to move the board contents up
        handleClose();
    };

    const handleImport = () => {
        handleClose();
    };

    const handleHelp = () => {
        // todo
        handleClose();
    };

    return (
        <div className="App">
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
                                    onClick={handleClick}>
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleExport}>Export</MenuItem>
                            <MenuItem onClick={handleImport}>Import</MenuItem>
                            <MenuItem onClick={handleHelp}>Help</MenuItem>
                        </Menu>

                        <Typography variant="h6" className={classes.title}>
                            Chrome Auto Grouping
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
            <Board></Board>
        </div>
    );
}

export default App;
