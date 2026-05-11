import { useEffect, useState } from 'react';
import api from '../api/axios';
import BoardCard from '../components/BoardCard';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  async function loadBoards() {
    try {
      const res = await api.get('/boards');
      setBoards(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load boards');
    }
  }

  async function createBoard(e) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const res = await api.post('/boards', { title });
      setBoards([res.data, ...boards]);
      setTitle('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create board');
    }
  }

  useEffect(() => {
    loadBoards();
  }, []);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Boards</h1>
          <p className="text-gray-600 mt-1">
            Create boards and manage tasks in realtime.
          </p>
        </div>

        <form onSubmit={createBoard} className="flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board title"
            className="border p-3 rounded-lg"
          />

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg">
            Add Board
          </button>
        </form>
      </div>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
      )}

      {boards.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center shadow">
          <h2 className="text-xl font-semibold">No boards yet</h2>
          <p className="text-gray-600 mt-2">
            Create your first board using the input above.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}