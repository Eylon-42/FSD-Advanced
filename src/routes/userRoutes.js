const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const {register, login, logout, getProfile, updateProfile, deleteProfile, refreshToken} = require('../controllers/userController')


router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout); 
router.post('/refresh-token', refreshToken);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);

module.exports = router;