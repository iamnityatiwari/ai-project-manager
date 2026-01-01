import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, Card, CardContent, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import { Add as AddIcon, Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon, Pending as PendingIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                api.get('/tasks/stats'),
                api.get('/tasks')
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <Container sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const statusData = [
        { name: 'Todo', value: stats.todo },
        { name: 'In Progress', value: stats.inProgress },
        { name: 'Done', value: stats.done }
    ];

    const priorityData = [
        { name: 'High', value: stats.high, color: '#FF8042' },
        { name: 'Medium', value: stats.medium, color: '#FFBB28' },
        { name: 'Low', value: stats.low, color: '#00C49F' }
    ];

    const upcomingDeadlines = tasks
        .filter(t => t.deadline && t.status !== 'Done')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

    const recentTasks = tasks.slice(0, 5);

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Dashboard</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/board')}
                >
                    Go to Board
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: '#e3f2fd' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Tasks
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.total}
                                    </Typography>
                                </Box>
                                <AssignmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: '#fff3e0' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        In Progress
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.inProgress}
                                    </Typography>
                                </Box>
                                <PendingIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: '#e8f5e9' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Completed
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.done}
                                    </Typography>
                                </Box>
                                <CheckCircleIcon sx={{ fontSize: 40, color: '#388e3c' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: '#ffebee' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Overdue
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.overdue}
                                    </Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Tasks by Status</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Priority Distribution</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={priorityData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8">
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Lists */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Upcoming Deadlines</Typography>
                        {upcomingDeadlines.length === 0 ? (
                            <Typography color="text.secondary">No upcoming deadlines</Typography>
                        ) : (
                            <List>
                                {upcomingDeadlines.map((task) => (
                                    <ListItem key={task._id} divider>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={`Due: ${new Date(task.deadline).toLocaleDateString()}`}
                                        />
                                        <Chip
                                            label={task.priority}
                                            color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Recent Tasks</Typography>
                        {recentTasks.length === 0 ? (
                            <Typography color="text.secondary">No tasks yet</Typography>
                        ) : (
                            <List>
                                {recentTasks.map((task) => (
                                    <ListItem key={task._id} divider>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={task.assignedTo ? `Assigned to: ${task.assignedTo.name}` : 'Unassigned'}
                                        />
                                        <Chip label={task.status} size="small" />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
