const express = require('express');
const { createComment, getAllComments, getCommentsByPost, updateComment, deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.post('/', createComment);
router.get('/', getAllComments);
router.get('/:postId', getCommentsByPost);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;