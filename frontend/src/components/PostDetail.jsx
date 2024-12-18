import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const { id } = useParams();
  const history = useNavigate();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`https://mern-blog-backend-7svl.onrender.com/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPost(res.data);
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    };
    fetchPost();
  }, [id]);

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await axios.put(`https://mern-blog-backend-7svl.onrender.com/api/posts/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setPost(res.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`https://mern-blog-backend-7svl.onrender.com/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        history('/');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  if (!post) return <div className="text-center text-white">Loading...</div>;

  const isAuthor = currentUserId === post.author._id;

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back to Home
        </Link>
      </div>
      {isEditing ? (
        <form onSubmit={handleEdit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-300">Image</label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-600 file:text-white
                hover:file:bg-indigo-700"
            />
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
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-400 mb-6">By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}</p>
          {post.image && (
            <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}
          <div className="prose prose-invert max-w-none">{post.content}</div>
          {isAuthor && (
            <div className="mt-8 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostDetail;

