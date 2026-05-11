import { Link } from 'react-router-dom';

export default function BoardCard({ board }) {
  return (
    <Link
      to={`/board/${board.id}`}
      className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition block"
    >
      <div className="flex justify-between items-start gap-3">
        <h3 className="text-xl font-bold text-gray-800">{board.title}</h3>

        <span
          className={`text-xs px-3 py-1 rounded-full ${
            board.role === 'owner'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {board.role}
        </span>
      </div>

      <p className="text-gray-500 mt-2">
        Created: {new Date(board.created_at).toLocaleDateString()}
      </p>
    </Link>
  );
}