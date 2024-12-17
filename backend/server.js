const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// User model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  bio: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// BlogPost model
const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Multer configuration
const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('author', 'username');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

app.post('/api/posts', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
    const post = await BlogPost.create({ 
      title, 
      content, 
      image, 
      author: req.user.userId 
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

app.put('/api/posts/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : req.body.image;
    const post = await BlogPost.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userId },
      { title, content, image },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await BlogPost.findOneAndDelete({ _id: req.params.id, author: req.user.userId });
    if (!post) return res.status(404).json({ message: 'Post not found or unauthorized' });
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// User profile routes
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

app.put('/api/users/:id', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const profileImage = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : req.body.profileImage;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, _id: req.user.userId },
      { username, email, profileImage, bio },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, _id: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });
    // Also delete all posts by this user
    await BlogPost.deleteMany({ author: req.params.id });
    res.json({ message: 'User and associated posts deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// New route to get posts by user
app.get('/api/posts/user/:userId', authMiddleware, async (req, res) => {
  try {
    const posts = await BlogPost.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

