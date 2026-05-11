import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
        CollabBoard
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <span className="text-gray-700">Hi, {user.name}</span>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-gray-700 hover:text-blue-600" to="/login">
              Login
            </Link>

            <Link className="text-gray-700 hover:text-blue-600" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}