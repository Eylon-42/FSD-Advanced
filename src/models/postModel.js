const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    sender: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);