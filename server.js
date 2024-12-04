const express = require('express');
require('dotenv').config();
const app = express();
const postRoutes = require('./src/routes/postRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const userRoutes = require('./src/routes/userRoutes');
const mongoose = require('mongoose')

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');


const mongoUrl = process.env.MONGO_URI ?? 'mongodb://localhost:27017/blog-api';

// Middleware
app.use(express.json());

// Swagger API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Routes
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/api/users', userRoutes);

const connectDB = () => {
    return new Promise((resolve,reject) => {
        mongoose.connect(mongoUrl)
        .then(() => {
            console.log(`Database connected successfully at ${mongoUrl}`);
            resolve(app)
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports = connectDB;