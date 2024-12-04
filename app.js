const connectDB = require('./server');
const PORT = process.env.PORT || 3000;

connectDB().then((app) => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
