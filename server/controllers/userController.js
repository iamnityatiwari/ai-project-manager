const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user workload
// @route   GET /api/users/:id/workload
// @access  Private
const getUserWorkload = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.params.id });

        const workload = {
            totalTasks: tasks.length,
            todoTasks: tasks.filter(t => t.status === 'Todo').length,
            inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
            doneTasks: tasks.filter(t => t.status === 'Done').length,
            totalEstimatedHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
            pendingEstimatedHours: tasks
                .filter(t => t.status !== 'Done')
                .reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
            upcomingDeadlines: tasks
                .filter(t => t.deadline && t.status !== 'Done')
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .slice(0, 5)
                .map(t => ({
                    taskId: t._id,
                    title: t.title,
                    deadline: t.deadline,
                    priority: t.priority
                }))
        };

        res.json(workload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team workload summary
// @route   GET /api/users/team/workload
// @access  Private
const getTeamWorkload = async (req, res) => {
    try {
        const users = await User.find({}).select('name email skills');

        const teamWorkload = await Promise.all(
            users.map(async (user) => {
                const tasks = await Task.find({ assignedTo: user._id });

                return {
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    skills: user.skills,
                    totalTasks: tasks.length,
                    activeTasks: tasks.filter(t => t.status !== 'Done').length,
                    estimatedHours: tasks
                        .filter(t => t.status !== 'Done')
                        .reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
                    highPriorityTasks: tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length
                };
            })
        );

        res.json(teamWorkload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    getUserWorkload,
    getTeamWorkload
};
