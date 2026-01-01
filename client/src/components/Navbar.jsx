import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    AI Project Manager
                </Typography>
                {user ? (
                    <Box display="flex" alignItems="center" gap={1}>
                        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
                        <Button color="inherit" component={Link} to="/board">Board</Button>
                        <Button color="inherit" component={Link} to="/projects">Projects</Button>
                        <Button color="inherit" component={Link} to="/team">Team</Button>
                        <Button color="inherit" component={Link} to="/ai-suggestions">AI</Button>
                        <NotificationCenter />
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                ) : (
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
