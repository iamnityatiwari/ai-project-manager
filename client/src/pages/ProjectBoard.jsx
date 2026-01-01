import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Grid } from '@mui/material';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const ProjectBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columns = ['Todo', 'In Progress', 'Done'];

    useEffect(() => {
        fetchTasks();
        fetchUsers();
        fetchProjects();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
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

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const taskId = active.id;
        const newStatus = over.id;

        // Update task status
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            setTasks(prev =>
                prev.map(task =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }

        setActiveId(null);
    };

    const handleCreateTask = () => {
        setCurrentTask(null);
        setModalOpen(true);
    };

    const handleEditTask = (task) => {
        setCurrentTask(task);
        setModalOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (taskData._id) {
                // Update existing task
                await api.put(`/tasks/${taskData._id}`, taskData);
            } else {
                // Create new task
                await api.post('/tasks', taskData);
            }
            fetchTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task');
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                setTasks(prev => prev.filter(task => task._id !== id));
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Kanban Board</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateTask}
                >
                    New Task
                </Button>
            </Box>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <Grid container spacing={2}>
                    {columns.map((status) => (
                        <Grid item xs={12} md={4} key={status}>
                            <Paper
                                sx={{
                                    p: 2,
                                    minHeight: '70vh',
                                    backgroundColor: 'grey.50'
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    {status} ({getTasksByStatus(status).length})
                                </Typography>

                                <SortableContext
                                    id={status}
                                    items={getTasksByStatus(status).map(t => t._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Box
                                        sx={{
                                            minHeight: '60vh',
                                            border: '2px dashed',
                                            borderColor: 'grey.300',
                                            borderRadius: 1,
                                            p: 1
                                        }}
                                        data-status={status}
                                    >
                                        {getTasksByStatus(status).map((task) => (
                                            <Box
                                                key={task._id}
                                                id={task._id}
                                                draggable
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const draggedTaskId = e.dataTransfer.getData('taskId');
                                                    if (draggedTaskId) {
                                                        handleDragEnd({
                                                            active: { id: draggedTaskId },
                                                            over: { id: status }
                                                        });
                                                    }
                                                }}
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('taskId', task._id);
                                                    setActiveId(task._id);
                                                }}
                                            >
                                                <TaskCard
                                                    task={task}
                                                    onEdit={handleEditTask}
                                                    onDelete={handleDeleteTask}
                                                    draggable={true}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </SortableContext>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <DragOverlay>
                    {activeTask ? (
                        <Box sx={{ opacity: 0.8 }}>
                            <TaskCard task={activeTask} />
                        </Box>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <TaskModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveTask}
                task={currentTask}
                users={users}
                projects={projects}
            />
        </Container>
    );
};

export default ProjectBoard;
