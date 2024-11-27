const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const { addToken } = require('../store/tokenStore');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid email or password');
    }
    const accessToken = generateAccessToken(user);
    console.log(`{\n${accessToken} \n \n}`);
    res.status(200).json({ message: 'Logged in successfully' });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  const token = req.headers['authorization'];
  addToken(token)
  res.send('Logged out successfully');
}); 

// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Update User Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete User Profile
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.send('User deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;