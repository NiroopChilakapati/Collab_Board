const pool = require('../config/db');

async function createBoard(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO boards (title, user_id) VALUES (?, ?)',
      [title, userId]
    );

    await pool.query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, userId, 'owner']
    );

    res.status(201).json({
      id: result.insertId,
      title,
      user_id: userId,
      role: 'owner'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getBoards(req, res) {
  try {
    const userId = req.user.id;

    const [boards] = await pool.query(
      `SELECT 
        b.*,
        bm.role
       FROM boards b
       JOIN board_members bm ON b.id = bm.board_id
       WHERE bm.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json(boards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getBoardById(req, res) {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;

    const [boards] = await pool.query(
      `SELECT 
        b.*,
        bm.role
       FROM boards b
       JOIN board_members bm ON b.id = bm.board_id
       WHERE b.id = ? AND bm.user_id = ?`,
      [boardId, userId]
    );

    if (boards.length === 0) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }

    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE board_id = ? ORDER BY created_at DESC',
      [boardId]
    );

    const [members] = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        bm.role
       FROM board_members bm
       JOIN users u ON bm.user_id = u.id
       WHERE bm.board_id = ?`,
      [boardId]
    );

    res.json({
      board: boards[0],
      tasks,
      members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function inviteMember(req, res) {
  try {
    const boardId = req.params.id;
    const ownerId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const [ownerCheck] = await pool.query(
      `SELECT * FROM board_members 
       WHERE board_id = ? AND user_id = ? AND role = 'owner'`,
      [boardId, ownerId]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({ message: 'Only board owner can invite members' });
    }

    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found. Ask them to register first.' });
    }

    const invitedUser = users[0];

    await pool.query(
      `INSERT IGNORE INTO board_members (board_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [boardId, invitedUser.id]
    );

    res.status(201).json({
      message: 'User invited successfully',
      member: {
        ...invitedUser,
        role: 'member'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
  inviteMember
};