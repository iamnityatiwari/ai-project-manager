import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AISuggestions from './pages/AISuggestions';
import ProjectBoard from './pages/ProjectBoard';
import TeamDashboard from './pages/TeamDashboard';
import Projects from './pages/Projects';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/board" element={
                        <PrivateRoute>
                            <ProjectBoard />
                        </PrivateRoute>
                    } />
                    <Route path="/projects" element={
                        <PrivateRoute>
                            <Projects />
                        </PrivateRoute>
                    } />
                    <Route path="/team" element={
                        <PrivateRoute>
                            <TeamDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/ai-suggestions" element={
                        <PrivateRoute>
                            <AISuggestions />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
