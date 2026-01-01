const express = require('express');
const {
    getUsers,
    getUserById,
    getUserWorkload,
    getTeamWorkload
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/team/workload', protect, getTeamWorkload);
router.get('/:id', protect, getUserById);
router.get('/:id/workload', protect, getUserWorkload);

module.exports = router;
