import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUserId } from '../utils';

const Navbar = () => {
  const location = useLocation();
  const history = useNavigate();
  const authenticated = isAuthenticated();
  const currentUserId = getCurrentUserId();

  const handleLogout = () => {
    localStorage.removeItem('token');
    history('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full h-16">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="https://t4.ftcdn.net/jpg/04/61/57/71/360_F_461577128_hjMInTQiQ0jETzj0Ohji4tdFjlNurQO4.jpg"
              alt="WebLog Logo"
              className="w-10 h-10 rounded-full mr-2"
            />
            <span className="text-xl font-bold text-white">WebLog</span>
          </Link>
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            <Link
              to="/"
              className={`${
                location.pathname === '/'
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
              } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
            >
              Home
            </Link>
            {authenticated && (
              <Link
                to="/create"
                className={`${
                  location.pathname === '/create'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Create Post
              </Link>
            )}
          </div>
          <div className="hidden sm:flex sm:items-center">
            {authenticated ? (
              <>
                <Link
                  to={`/users/${currentUserId}`}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="ml-4 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

