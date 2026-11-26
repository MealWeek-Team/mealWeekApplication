
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const ingredientRoutes = require('./routes/ingredients');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;

    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? 'ok' : 'error',
        db: dbConnected ? 'connected' : 'disconnected',
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);

// MongoDB connection
mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        console.log('Connected to MongoDB Atlas');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
