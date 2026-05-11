const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getBoardActivities
} = require('../controllers/activityController');

const router = express.Router();

router.get('/:id', authMiddleware, getBoardActivities);

module.exports = router;