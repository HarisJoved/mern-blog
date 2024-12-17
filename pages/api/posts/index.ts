import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import BlogPost from '../../../models/BlogPost';
import { authMiddleware } from '../../../lib/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const posts = await BlogPost.find().populate('author', 'username');
        res.status(200).json(posts);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
      }
      break;

    case 'POST':
      try {
        const { title, content } = req.body;
        const post = await BlogPost.create({ title, content, author: req.user.userId });
        res.status(201).json(post);
      } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}

export default authMiddleware(handler);

