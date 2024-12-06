const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { addToken } = require('../store/tokenStore');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password, refreshTokens: [] });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid email or password');
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save the refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      message: 'Logged in successfully',
      token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.logout = async (req, res) => {
  const token = req.headers['authorization'];
  const { refresh_token } = req.body;

  // Blacklist the access token
  addToken(token);

  // Remove the refresh token from the user's refreshTokens array
  if (refresh_token) {
    try {
      const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(payload.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refresh_token);
        await user.save();
      }
    } catch (error) {
      // Ignore errors related to invalid refresh tokens
    }
  }

  res.send('Logged out successfully');
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const { refresh_token } = req.body;

    // Blacklist the access token
    addToken(token);

    // Remove the refresh token from the user's refreshTokens array
    if (refresh_token) {
      try {
        const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refresh_token);
          await user.save();
        }
      } catch (error) {
        // Ignore errors related to invalid refresh tokens
      }
    }

    // Now delete the user
    await User.findByIdAndDelete(req.user.id);
    res.status(200).send('User deleted successfully');

  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(401).send('Refresh token required');

  try {
    const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).send('User not found');
    }

    // Check if refresh token is in user's refreshTokens array
    if (!user.refreshTokens.includes(refresh_token)) {
      return res.status(403).send('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({ token: accessToken });
  } catch (error) {
    res.status(403).send('Invalid refresh token');
  }
};