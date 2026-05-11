const { Server } = require('socket.io');

function socketHandler(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-board', (boardId) => {
      socket.join(`board-${boardId}`);
      console.log(`User joined board-${boardId}`);
    });

    socket.on('task-created', ({ boardId, task }) => {
      socket.to(`board-${boardId}`).emit('task-created', task);
    });

    socket.on('task-updated', ({ boardId, task }) => {
      socket.to(`board-${boardId}`).emit('task-updated', task);
    });

    socket.on('task-deleted', ({ boardId, taskId }) => {
      socket.to(`board-${boardId}`).emit('task-deleted', taskId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = socketHandler;