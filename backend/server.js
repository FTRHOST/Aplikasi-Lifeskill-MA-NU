const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load env vars
dotenv.config({ path: './.env' });

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Test DB Connection
db.getConnection()
    .then(connection => {
        console.log('MySQL Connected...');
        connection.release();
    })
    .catch(err => console.error('Error connecting to MySQL:', err));

// Mount routers
app.use('/api', authRoutes);
app.use('/api', studentRoutes);

// Simple route for checking if server is up
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
