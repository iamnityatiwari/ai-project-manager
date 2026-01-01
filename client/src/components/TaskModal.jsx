import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box, Grid } from '@mui/material';

const TaskModal = ({ open, onClose, onSave, task = null, users = [], projects = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Todo',
        assignedTo: '',
        project: '',
        deadline: '',
        estimatedHours: 0,
        tags: []
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                status: task.status || 'Todo',
                assignedTo: task.assignedTo?._id || '',
                project: task.project?._id || '',
                deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
                estimatedHours: task.estimatedHours || 0,
                tags: task.tags || []
            });
        } else {
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                status: 'Todo',
                assignedTo: '',
                project: '',
                deadline: '',
                estimatedHours: 0,
                tags: []
            });
        }
    }, [task, open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToDelete) });
    };

    const handleSubmit = () => {
        onSave({ ...formData, _id: task?._id });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            name="title"
                            label="Task Title"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                label="Priority"
                            >
                                <MenuItem value="Low">Low</MenuItem>
                                <MenuItem value="Medium">Medium</MenuItem>
                                <MenuItem value="High">High</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Status"
                            >
                                <MenuItem value="Todo">Todo</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="Done">Done</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Assign To</InputLabel>
                            <Select
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                label="Assign To"
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Project</InputLabel>
                            <Select
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                label="Project"
                            >
                                <MenuItem value="">No Project</MenuItem>
                                {projects.map((project) => (
                                    <MenuItem key={project._id} value={project._id}>
                                        {project.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            name="deadline"
                            label="Deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            name="estimatedHours"
                            label="Estimated Hours"
                            type="number"
                            value={formData.estimatedHours}
                            onChange={handleChange}
                            fullWidth
                            inputProps={{ min: 0, step: 0.5 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" gap={1}>
                            <TextField
                                label="Add Tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                size="small"
                            />
                            <Button onClick={handleAddTag} variant="outlined">Add</Button>
                        </Box>
                        <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                            {formData.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    color="primary"
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!formData.title}>
                    {task ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskModal;
