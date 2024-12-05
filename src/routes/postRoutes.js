const express = require('express');
const { createPost, getAllPosts, getPostById, deletePostById, getPostsBySender, updatePost } = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, createPost);
router.get('/', authMiddleware, (req, res, next) => {
    // Check if 'sender' query parameter exists
    if (req.query.sender) {
        return getPostsBySender(req, res, next);
    }
    return getAllPosts(req, res, next);
});
router.get('/:id', authMiddleware, getPostById);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePostById);

module.exports = router;