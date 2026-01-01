const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const { project, status, assignedTo } = req.query;
        const filter = {};

        if (project) filter.project = project;
        if (status) filter.status = status;
        if (assignedTo) filter.assignedTo = assignedTo;

        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email')
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
    try {
        const tasks = await Task.find({});

        const stats = {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'Todo').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            done: tasks.filter(t => t.status === 'Done').length,
            high: tasks.filter(t => t.priority === 'High').length,
            medium: tasks.filter(t => t.priority === 'Medium').length,
            low: tasks.filter(t => t.priority === 'Low').length,
            overdue: tasks.filter(t =>
                t.deadline &&
                new Date(t.deadline) < new Date() &&
                t.status !== 'Done'
            ).length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, description, priority, deadline, assignedTo, project, estimatedHours, tags } = req.body;

        const task = new Task({
            title,
            description,
            priority,
            deadline,
            assignedTo: assignedTo || null,
            project: project || null,
            estimatedHours: estimatedHours || 0,
            tags: tags || [],
            createdBy: req.user._id,
            status: 'Todo'
        });

        const createdTask = await task.save();
        const populatedTask = await Task.findById(createdTask._id)
            .populate('assignedTo', 'name email')
            .populate('project', 'name')
            .populate('createdBy', 'name email');

        // Create notification if task is assigned
        if (assignedTo && assignedTo !== req.user._id.toString()) {
            await createNotification({
                recipient: assignedTo,
                type: 'task_assigned',
                message: `You have been assigned to task: "${title}"`,
                relatedTask: createdTask._id,
                sender: req.user._id
            });
        }

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, deadline, assignedTo, project, estimatedHours, tags } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;
        const oldStatus = task.status;

        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.deadline = deadline || task.deadline;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (project !== undefined) task.project = project;
        if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
        if (tags !== undefined) task.tags = tags;

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id)
            .populate('assignedTo', 'name email')
            .populate('project', 'name')
            .populate('createdBy', 'name email');

        // Create notification if assignee changed
        if (assignedTo && assignedTo !== oldAssignee && assignedTo !== req.user._id.toString()) {
            await createNotification({
                recipient: assignedTo,
                type: 'task_assigned',
                message: `You have been assigned to task: "${task.title}"`,
                relatedTask: task._id,
                sender: req.user._id
            });
        }

        // Create notification if status changed to Done
        if (status === 'Done' && oldStatus !== 'Done' && task.createdBy && task.createdBy.toString() !== req.user._id.toString()) {
            await createNotification({
                recipient: task.createdBy,
                type: 'task_completed',
                message: `Task "${task.title}" has been completed`,
                relatedTask: task._id,
                sender: req.user._id
            });
        }

        res.json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskStats,
    createTask,
    updateTask,
    deleteTask,
};

