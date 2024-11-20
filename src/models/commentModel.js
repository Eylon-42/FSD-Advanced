const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    postId: { type: Number, ref: 'Post', required: true },
    content: { type: String, required: true },
    sender: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);