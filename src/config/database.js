const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URI ?? 'mongodb://localhost:27017/blog-api';
const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl);
        console.log(`Database connected successfully at ${mongoUrl}`);
    } catch (err) {
        console.error('Database connection error: ', err);
        process.exit(1);
    }
};

module.exports = connectDB;