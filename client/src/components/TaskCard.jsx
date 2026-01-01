import { Card, CardContent, CardActions, Typography, Chip, IconButton, Box } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Person as PersonIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

const TaskCard = ({ task, onEdit, onDelete, draggable = false }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'error';
            case 'Medium':
                return 'warning';
            case 'Low':
                return 'success';
            default:
                return 'default';
        }
    };

    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done';

    return (
        <Card
            sx={{
                mb: 2,
                cursor: draggable ? 'grab' : 'default',
                borderLeft: `4px solid`,
                borderLeftColor: getPriorityColor(task.priority) + '.main',
                '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                }
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="div" gutterBottom>
                        {task.title}
                    </Typography>
                    <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                    />
                </Box>

                {task.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {task.description}
                    </Typography>
                )}

                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                    {task.assignedTo && (
                        <Chip
                            icon={<PersonIcon />}
                            label={task.assignedTo.name}
                            size="small"
                            variant="outlined"
                        />
                    )}

                    {task.deadline && (
                        <Chip
                            icon={<CalendarIcon />}
                            label={new Date(task.deadline).toLocaleDateString()}
                            size="small"
                            variant="outlined"
                            color={isOverdue ? 'error' : 'default'}
                        />
                    )}

                    {task.estimatedHours > 0 && (
                        <Chip
                            label={`${task.estimatedHours}h`}
                            size="small"
                            variant="outlined"
                        />
                    )}

                    {task.tags && task.tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            color="primary"
                        />
                    ))}
                </Box>
            </CardContent>

            <CardActions>
                {onEdit && (
                    <IconButton size="small" color="primary" onClick={() => onEdit(task)}>
                        <EditIcon />
                    </IconButton>
                )}
                {onDelete && (
                    <IconButton size="small" color="error" onClick={() => onDelete(task._id)}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </CardActions>
        </Card>
    );
};

export default TaskCard;
