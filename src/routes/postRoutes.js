const express = require('express');
const { createPost, getAllPosts, getPostById, deletePostById, getPostsBySender, updatePost } = require('../controllers/postController');

const router = express.Router();

router.post('/', createPost);
router.get('/', (req, res, next) => {
    // Check if 'sender' query parameter exists
    if (req.query.sender) {
        return getPostsBySender(req, res, next);
    }
    return getAllPosts(req, res, next);
});
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePostById);

module.exports = router;