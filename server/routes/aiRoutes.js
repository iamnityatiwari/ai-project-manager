const express = require('express');
const router = express.Router();
const { getTaskSuggestions } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/suggest', protect, getTaskSuggestions);

module.exports = router;
