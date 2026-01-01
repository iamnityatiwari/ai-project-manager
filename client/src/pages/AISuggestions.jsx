import { useState, useEffect } from 'react';
import { Container, Typography, Button, Paper, List, ListItem, ListItemText, Divider, Chip, Box, CircularProgress } from '@mui/material';
import { Psychology as PsychologyIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import api from '../api/axios';

const AISuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasksAndUsers();
    }, []);

    const fetchTasksAndUsers = async () => {
        try {
            const [tasksRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/users')
            ]);
            setTasks(tasksRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getSuggestions = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/ai/suggest');
            if (data && Array.isArray(data)) {
                setSuggestions(data);
            } else {
                alert(data.message || 'No suggestions available');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to get suggestions. Please check if you have unassigned tasks.');
        } finally {
            setLoading(false);
        }
    };

    const applySuggestion = async (suggestion) => {
        try {
            await api.put(`/tasks/${suggestion.taskId}`, {
                assignedTo: suggestion.assignedTo,
                priority: suggestion.suggestedPriority,
                deadline: suggestion.suggestedDeadline
            });
            setSuggestions(suggestions.filter(s => s.taskId !== suggestion.taskId));
            alert('Suggestion applied successfully!');
            fetchTasksAndUsers(); // Refresh data
        } catch (error) {
            console.error(error);
            alert('Failed to apply suggestion');
        }
    };

    const applyAllSuggestions = async () => {
        if (window.confirm(`Apply all ${suggestions.length} suggestions?`)) {
            try {
                await Promise.all(suggestions.map(s => applySuggestion(s)));
                alert('All suggestions applied!');
            } catch (error) {
                console.error(error);
                alert('Some suggestions failed to apply');
            }
        }
    };

    const getTaskTitle = (taskId) => {
        const task = tasks.find(t => t._id === taskId);
        return task ? task.title : 'Unknown Task';
    };

    const getUserName = (userId) => {
        const user = users.find(u => u._id === userId);
        return user ? user.name : 'Unknown User';
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                <PsychologyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                AI Task Recommendations
            </Typography>

            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body1" gutterBottom>
                    Our AI analyzes your team's skills and current workload to recommend the best task assignments, priorities, and realistic deadlines.
                </Typography>
                <Box display="flex" gap={2} mt={2}>
                    <Button
                        variant="contained"
                        onClick={getSuggestions}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
                    >
                        {loading ? 'Analyzing...' : 'Get AI Recommendations'}
                    </Button>
                    {suggestions.length > 0 && (
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={applyAllSuggestions}
                            startIcon={<CheckCircleIcon />}
                        >
                            Apply All ({suggestions.length})
                        </Button>
                    )}
                </Box>
            </Paper>

            {suggestions.length === 0 && !loading && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No suggestions yet. Click "Get AI Recommendations" to analyze your tasks.
                    </Typography>
                </Paper>
            )}

            <List>
                {suggestions.map((suggestion, index) => (
                    <Paper key={index} sx={{ mb: 2, p: 2 }}>
                        <ListItem
                            alignItems="flex-start"
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                        >
                            <Box display="flex" justifyContent="space-between" width="100%" mb={2}>
                                <Typography variant="h6">
                                    {getTaskTitle(suggestion.taskId)}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => applySuggestion(suggestion)}
                                    startIcon={<CheckCircleIcon />}
                                >
                                    Apply
                                </Button>
                            </Box>

                            <ListItemText
                                secondary={
                                    <Box>
                                        <Typography component="div" variant="body2" color="text.primary" sx={{ mb: 1 }}>
                                            <strong>Recommended Assignee:</strong> {getUserName(suggestion.assignedTo)}
                                        </Typography>
                                        <Typography component="div" variant="body2" sx={{ mb: 1 }}>
                                            <strong>Reason:</strong> {suggestion.reason}
                                        </Typography>
                                        <Box display="flex" gap={1} mt={1}>
                                            <Chip
                                                size="small"
                                                label={`Priority: ${suggestion.suggestedPriority}`}
                                                color={suggestion.suggestedPriority === 'High' ? 'error' : suggestion.suggestedPriority === 'Medium' ? 'warning' : 'success'}
                                            />
                                            <Chip
                                                size="small"
                                                label={`Deadline: ${new Date(suggestion.suggestedDeadline).toLocaleDateString()}`}
                                            />
                                        </Box>
                                    </Box>
                                }
                            />
                        </ListItem>
                        {index < suggestions.length - 1 && <Divider />}
                    </Paper>
                ))}
            </List>
        </Container>
    );
};

export default AISuggestions;
