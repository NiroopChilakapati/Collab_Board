const pool = require('../config/db');

async function getBoardActivities(req, res) {
  try {
    const boardId = req.params.id;

    const [activities] = await pool.query(
      `SELECT 
        a.id,
        a.action,
        a.created_at,
        u.name
       FROM activity_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.board_id = ?
       ORDER BY a.created_at DESC`,
      [boardId]
    );

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getBoardActivities
};