import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Box, LinearProgress } from '@mui/material';
import { Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import api from '../api/axios';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Planning',
        teamMembers: [],
        startDate: '',
        endDate: '',
        tags: []
    });

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateProject = () => {
        setCurrentProject(null);
        setFormData({
            name: '',
            description: '',
            status: 'Planning',
            teamMembers: [],
            startDate: '',
            endDate: '',
            tags: []
        });
        setModalOpen(true);
    };

    const handleEditProject = (project) => {
        setCurrentProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            status: project.status,
            teamMembers: project.teamMembers.map(m => m._id),
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            tags: project.tags || []
        });
        setModalOpen(true);
    };

    const handleSaveProject = async () => {
        try {
            if (currentProject) {
                await api.put(`/projects/${currentProject._id}`, formData);
            } else {
                await api.post('/projects', formData);
            }
            setModalOpen(false);
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project');
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await api.delete(`/projects/${id}`);
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Completed':
                return 'info';
            case 'On Hold':
                return 'warning';
            case 'Archived':
                return 'default';
            default:
                return 'primary';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Projects</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateProject}
                >
                    New Project
                </Button>
            </Box>

            <Grid container spacing={3}>
                {projects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} key={project._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Typography variant="h6" component="div">
                                        {project.name}
                                    </Typography>
                                    <Chip
                                        label={project.status}
                                        color={getStatusColor(project.status)}
                                        size="small"
                                    />
                                </Box>

                                {project.description && (
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        {project.description}
                                    </Typography>
                                )}

                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <PeopleIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {project.teamMembers.length} team members
                                    </Typography>
                                </Box>

                                {project.teamMembers.length > 0 && (
                                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                                        {project.teamMembers.slice(0, 3).map((member) => (
                                            <Chip
                                                key={member._id}
                                                label={member.name}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                        {project.teamMembers.length > 3 && (
                                            <Chip
                                                label={`+${project.teamMembers.length - 3} more`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                )}

                                {project.startDate && (
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Start: {new Date(project.startDate).toLocaleDateString()}
                                    </Typography>
                                )}
                                {project.endDate && (
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        End: {new Date(project.endDate).toLocaleDateString()}
                                    </Typography>
                                )}

                                {project.tags && project.tags.length > 0 && (
                                    <Box mt={2} display="flex" flexWrap="wrap" gap={0.5}>
                                        {project.tags.map((tag, idx) => (
                                            <Chip key={idx} label={tag} size="small" color="primary" />
                                        ))}
                                    </Box>
                                )}
                            </CardContent>

                            <CardActions>
                                <Button size="small" onClick={() => handleEditProject(project)}>
                                    Edit
                                </Button>
                                <Button size="small" color="error" onClick={() => handleDeleteProject(project._id)}>
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Project Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{currentProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Project Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="End Date"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Team Members</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {users.map((user) => (
                                    <Chip
                                        key={user._id}
                                        label={user.name}
                                        onClick={() => {
                                            const isSelected = formData.teamMembers.includes(user._id);
                                            setFormData({
                                                ...formData,
                                                teamMembers: isSelected
                                                    ? formData.teamMembers.filter(id => id !== user._id)
                                                    : [...formData.teamMembers, user._id]
                                            });
                                        }}
                                        color={formData.teamMembers.includes(user._id) ? 'primary' : 'default'}
                                        variant={formData.teamMembers.includes(user._id) ? 'filled' : 'outlined'}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveProject} variant="contained" disabled={!formData.name}>
                        {currentProject ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Projects;
