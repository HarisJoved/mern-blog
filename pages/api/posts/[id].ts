import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import BlogPost from '../../../models/BlogPost';
import { authMiddleware } from '../../../lib/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const post = await BlogPost.findById(id).populate('author', 'username');
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
      }
      break;

    case 'PUT':
      try {
        const { title, content } = req.body;
        const post = await BlogPost.findOneAndUpdate(
          { _id: id, author: req.user.userId },
          { title, content },
          { new: true }
        );
        if (!post) {
          return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
        res.status(200).json(post);
      } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
      }
      break;

    case 'DELETE':
      try {
        const post = await BlogPost.findOneAndDelete({ _id: id, author: req.user.userId });
        if (!post) {
          return res.status(404).json({ message: 'Post not found or unauthorized' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}

export default authMiddleware(handler);

