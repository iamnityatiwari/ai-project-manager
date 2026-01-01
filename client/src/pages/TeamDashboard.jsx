import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Card, CardContent, Avatar, Box, Chip, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Person as PersonIcon } from '@mui/icons-material';
import api from '../api/axios';

const TeamDashboard = () => {
    const [teamWorkload, setTeamWorkload] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamWorkload();
    }, []);

    const fetchTeamWorkload = async () => {
        try {
            const { data } = await api.get('/users/team/workload');
            setTeamWorkload(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching team workload:', error);
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const chartData = teamWorkload.map(member => ({
        name: member.name.split(' ')[0], // First name only for chart
        activeTasks: member.activeTasks,
        estimatedHours: member.estimatedHours
    }));

    const pieData = teamWorkload.map(member => ({
        name: member.name,
        value: member.activeTasks
    }));

    if (loading) {
        return <Container sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Team Dashboard</Typography>

            {/* Team Members Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {teamWorkload.map((member, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={member.userId}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], mr: 2 }}>
                                        <PersonIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">{member.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {member.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                {member.skills && member.skills.length > 0 && (
                                    <Box mb={2} display="flex" flexWrap="wrap" gap={0.5}>
                                        {member.skills.slice(0, 3).map((skill, idx) => (
                                            <Chip key={idx} label={skill} size="small" />
                                        ))}
                                    </Box>
                                )}

                                <Box mb={1}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2">Active Tasks</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {member.activeTasks} / {member.totalTasks}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={member.totalTasks > 0 ? (member.activeTasks / member.totalTasks) * 100 : 0}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>

                                <Box display="flex" justifyContent="space-between" mt={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Est. Hours:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {member.estimatedHours}h
                                    </Typography>
                                </Box>

                                {member.highPriorityTasks > 0 && (
                                    <Chip
                                        label={`${member.highPriorityTasks} High Priority`}
                                        color="error"
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Workload Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Team Workload - Active Tasks & Hours</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="activeTasks" fill="#8884d8" name="Active Tasks" />
                                <Bar yAxisId="right" dataKey="estimatedHours" fill="#82ca9d" name="Est. Hours" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Task Distribution</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeamDashboard;
