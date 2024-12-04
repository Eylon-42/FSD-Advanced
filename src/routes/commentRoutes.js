const express = require('express');
const { createComment, getAllComments,getCommentById, getCommentsByPost, updateComment, deleteComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');


const router = express.Router();

router.post('/',authMiddleware, createComment);
router.get('/', authMiddleware, (req, res, next) => {
    if(req.query.sender){
        return getCommentsByPost(req, res, next)
    }
    return getAllComments(req, res, next)
});
router.get('/:id', authMiddleware, getCommentById)
router.put('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);

module.exports = router;