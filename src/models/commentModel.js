const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    sender: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);