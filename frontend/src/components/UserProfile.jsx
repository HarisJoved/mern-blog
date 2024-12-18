import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const history = useNavigate();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`https://mern-blog-backend-7svl.onrender.com/api/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(res.data);
        setUsername(res.data.username);
        setEmail(res.data.email);
        setProfileImage(res.data.profileImage);
        setBio(res.data.bio);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    };
    fetchUser();
  }, [id]);

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`https://mern-blog-backend-7svl.onrender.com/api/users/${id}`,
        { username, email, profileImage, bio },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete(`https://mern-blog-backend-7svl.onrender.com/api/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        localStorage.removeItem('token');
        history('/');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    }
  };

  if (!user) return <div className="text-center text-white">Loading...</div>;

  const isOwnProfile = currentUserId === user._id;

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white">
      {isEditing ? (
        <form onSubmit={handleEdit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-300">Profile Image URL</label>
            <input
              type="text"
              id="profileImage"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center space-x-4 mb-6">
            <img src={user.profileImage || '/placeholder.svg?height=100&width=100'} alt={user.username} className="w-24 h-24 rounded-full object-cover bg-gray-700" />
            <div>
              <h1 className="text-3xl font-bold text-indigo-300">{user.username}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-indigo-300 mb-2">Bio</h2>
            <p className="text-gray-300">{user.bio || 'No bio provided.'}</p>
          </div>
          {isOwnProfile && (
            <div className="mt-8 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfile;

