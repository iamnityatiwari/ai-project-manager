const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    const tasks = await Task.find({}).populate('assignedTo', 'name email');
    res.json(tasks);
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { title, description, priority, deadline, assignedTo } = req.body;

    const task = new Task({
        title,
        description,
        priority,
        deadline,
        assignedTo: assignedTo || null, // Can be null initially
        status: 'Todo'
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { title, description, status, priority, deadline, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);

    if (task) {
        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.deadline = deadline || task.deadline;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};
