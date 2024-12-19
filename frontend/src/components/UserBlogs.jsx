import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils';

const UserBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const userId = getCurrentUserId();
        const res = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user posts');
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-indigo-300 mb-6">My Blog Posts</h2>
      {posts.length === 0 ? (
        <p className="text-gray-300">You haven't created any blog posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-gray-700 shadow-lg rounded-lg overflow-hidden flex flex-col">
              {post.image && (
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold mb-2">
                  <Link to={`/posts/${post._id}`} className="text-indigo-300 hover:text-indigo-200">{post.title}</Link>
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Created on {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-300">
                  {post.content.substring(0, 100)}
                  {post.content.length > 100 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBlogs;

