const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    deadline: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Enhanced to reference Project model
    estimatedHours: { type: Number, default: 0 }, // For workload calculations
    tags: [{ type: String }], // For categorization and filtering
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
