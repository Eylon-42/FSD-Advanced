const express = require('express');
const app = express();
const connectDB = require('./src/config/database');

const postRoutes = require('./src/routes/postRoutes');
const commentRoutes = require('./src/routes/commentRoutes');


const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);


// Database Connection
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
