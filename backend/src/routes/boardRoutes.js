const express = require('express');
const {
  createBoard,
  getBoards,
  getBoardById,
  inviteMember
} = require('../controllers/boardController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createBoard);
router.get('/', authMiddleware, getBoards);
router.get('/:id', authMiddleware, getBoardById);
router.post('/:id/invite', authMiddleware, inviteMember);

module.exports = router;