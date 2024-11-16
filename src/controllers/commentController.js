const Comment = require('../models/commentModel');

exports.createComment = async (req, res) => {
    try {
        const comment = await Comment.create(req.body);
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        res.status(200).json(comment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};