const express = require('express');
const {
  createTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createTask);
router.patch('/:id/status', authMiddleware, updateTaskStatus);
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;