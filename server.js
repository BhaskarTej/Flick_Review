require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

app.use('/images', express.static('public/images'));

const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER || 'root',  
    password: process.env.DB_PASSWORD || 'microlab087',  
    database: process.env.DB_NAME || 'flick_review'
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1); // Stop the server if DB fails
    }
    console.log('✅ Connected to MySQL database');
});

// API route to get movies by genre
app.get('/api/movies/:genre', (req, res) => {
    const genre = req.params.genre;
    const query = `SELECT * FROM movies WHERE genre = ?`;

    db.query(query, [genre], (err, results) => {
        if (err) {
            console.error('❌ Database query failed:', err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        if (results.length === 0) {
            console.warn(`⚠️ No movies found for genre: ${genre}`);
        }
        res.json(results);
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
