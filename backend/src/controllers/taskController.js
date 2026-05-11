const pool = require('../config/db');

async function createActivity(boardId, userId, action) {
  await pool.query(
    `INSERT INTO activity_logs (board_id, user_id, action)
     VALUES (?, ?, ?)`,
    [boardId, userId, action]
  );
}

async function createTask(req, res) {
  try {
    const { title, description, status, board_id } = req.body;

    const userId = req.user.id;
    const userName = req.user.name;

    if (!title || !board_id) {
      return res.status(400).json({
        message: 'Title and board_id are required'
      });
    }

    const taskStatus = status || 'todo';

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, status, board_id)
       VALUES (?, ?, ?, ?)`,
      [title, description || '', taskStatus, board_id]
    );

    await createActivity(
      board_id,
      userId,
      `${userName} created task "${title}"`
    );

    const newTask = {
      id: result.insertId,
      title,
      description: description || '',
      status: taskStatus,
      board_id
    };

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    const userId = req.user.id;
    const userName = req.user.name;

    if (!status) {
      return res.status(400).json({
        message: 'Status is required'
      });
    }

    const [existingTasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    const existingTask = existingTasks[0];

    await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, taskId]
    );

    await createActivity(
      existingTask.board_id,
      userId,
      `${userName} moved task "${existingTask.title}" to ${status}`
    );

    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    res.json(tasks[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteTask(req, res) {
  try {
    const taskId = req.params.id;

    const userId = req.user.id;
    const userName = req.user.name;

    const [existingTasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    const existingTask = existingTasks[0];

    await pool.query(
      'DELETE FROM tasks WHERE id = ?',
      [taskId]
    );

    await createActivity(
      existingTask.board_id,
      userId,
      `${userName} deleted task "${existingTask.title}"`
    );

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createTask,
  updateTaskStatus,
  deleteTask
};