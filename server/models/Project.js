const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'],
        default: 'Planning'
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    tags: [{
        type: String
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
