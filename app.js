const express = require('express');

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

const app = express();

const connectDB = require('./src/config/database');

const postRoutes = require('./src/routes/postRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const authRoutes = require('./src/routes/authRoutes');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Swagger API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));


// Routes
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/api/auth', authRoutes);



// Database Connection
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
