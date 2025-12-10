const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the dist directory (production build)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler to serve index.html for any route (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server is running on http://localhost:${PORT}`);
});