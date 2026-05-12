import { io } from 'socket.io-client';

const socket = io('https://collab-board-tta3.onrender.com', {
  autoConnect: false
});

export default socket;