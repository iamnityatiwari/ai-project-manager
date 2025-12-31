import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, CardActions } from '@mui/material';
import api from '../api/axios';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', { title: newTaskTitle, description: newTaskDesc });
            setNewTaskTitle('');
            setNewTaskDesc('');
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (id) => {
        if (confirm('Delete task?')) {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        }
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Project Dashboard</Typography>

            <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="h6">Add New Task</Typography>
                <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <TextField
                        label="Task Title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        required
                        size="small"
                    />
                    <TextField
                        label="Description"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        size="small"
                    />
                    <Button type="submit" variant="contained">Add Task</Button>
                </form>
            </Paper>

            <Typography variant="h5" gutterBottom>Tasks</Typography>
            <Grid container spacing={3}>
                {tasks.map((task) => (
                    <Grid item xs={12} sm={6} md={4} key={task._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{task.title}</Typography>
                                <Typography color="textSecondary" gutterBottom>{task.status} - {task.priority}</Typography>
                                <Typography variant="body2">{task.description}</Typography>
                                {task.assignedTo && (
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        Assigned to: {task.assignedTo.name}
                                    </Typography>
                                )}
                                {task.deadline && (
                                    <Typography variant="caption" display="block">
                                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="error" onClick={() => handleDeleteTask(task._id)}>Delete</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard;
