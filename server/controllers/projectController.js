const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate('teamMembers', 'name email skills')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single project with tasks
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('teamMembers', 'name email skills')
            .populate('createdBy', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Get all tasks for this project
        const tasks = await Task.find({ project: req.params.id })
            .populate('assignedTo', 'name email');

        res.json({ project, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    try {
        const { name, description, teamMembers, startDate, endDate, tags } = req.body;

        const project = new Project({
            name,
            description,
            teamMembers: teamMembers || [],
            createdBy: req.user._id,
            startDate,
            endDate,
            tags: tags || []
        });

        const createdProject = await project.save();
        const populatedProject = await Project.findById(createdProject._id)
            .populate('teamMembers', 'name email skills')
            .populate('createdBy', 'name email');

        res.status(201).json(populatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    try {
        const { name, description, status, teamMembers, startDate, endDate, tags } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.name = name || project.name;
        project.description = description || project.description;
        project.status = status || project.status;
        if (teamMembers !== undefined) project.teamMembers = teamMembers;
        if (startDate !== undefined) project.startDate = startDate;
        if (endDate !== undefined) project.endDate = endDate;
        if (tags !== undefined) project.tags = tags;

        const updatedProject = await project.save();
        const populatedProject = await Project.findById(updatedProject._id)
            .populate('teamMembers', 'name email skills')
            .populate('createdBy', 'name email');

        res.json(populatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
const getProjectStats = async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.id });

        const stats = {
            totalTasks: tasks.length,
            todoTasks: tasks.filter(t => t.status === 'Todo').length,
            inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
            doneTasks: tasks.filter(t => t.status === 'Done').length,
            highPriority: tasks.filter(t => t.priority === 'High').length,
            mediumPriority: tasks.filter(t => t.priority === 'Medium').length,
            lowPriority: tasks.filter(t => t.priority === 'Low').length,
            overdueTasks: tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Done').length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats
};
