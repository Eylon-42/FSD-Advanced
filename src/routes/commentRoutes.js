const express = require('express');
const { createComment, getAllComments,getCommentById, getCommentsByPost, updateComment, deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.post('/', createComment);
router.get('/', (req, res, next) => {
    if(req.query.sender){
        return getCommentsByPost(req, res, next)
    }
    return getAllComments(req, res, next)
});
router.get('/:id', getCommentById)
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;