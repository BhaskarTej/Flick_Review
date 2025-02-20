const express = require('express');  // Import Express
const path = require('path');        // Import Path module

const app = express();               // Create Express app
const PORT = process.env.PORT || 3000;  // Set the port to 3000

// Serve static files from 'views' folder
app.use(express.static(path.join(__dirname, 'views')));

// Route to serve index.html when visiting '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
