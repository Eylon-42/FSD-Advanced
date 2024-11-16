const express = require('express');
const app = express();
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database Connection
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
