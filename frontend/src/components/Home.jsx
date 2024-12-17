import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UserBlogs from './UserBlogs';
import { isAuthenticated } from '../utils';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching posts');
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8 bg-gray-800 min-h-screen text-white p-8">
      {isAuthenticated() && <UserBlogs />}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-indigo-300">Recent Blog Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-gray-700 shadow-lg rounded-lg overflow-hidden">
              {post.image && (
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  <Link to={`/posts/${post._id}`} className="text-indigo-300 hover:text-indigo-200">{post.title}</Link>
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-300">{post.content.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

