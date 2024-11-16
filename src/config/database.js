const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/blog-api');
        console.log('Database connected successfully at mongodb://localhost:27017/blog-api');
    } catch (err) {
        console.error('Database connection error: ', err);
        process.exit(1);
    }
};

module.exports = connectDB;