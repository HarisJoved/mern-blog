import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
}

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Recent Blog Posts</h1>
        {posts.map((post) => (
          <div key={post._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                <Link href={`/posts/${post._id}`}>{post.title}</Link>
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">{post.content.substring(0, 200)}...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

