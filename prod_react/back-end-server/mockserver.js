// server.js
const express = require('express');
const app = express();
const PORT = 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// GET route
app.get('/', (req, res) => {
  res.type('text/plain').send(
    `Hello agent. You're close...\nBut to see the flag, POST me the secret.\n{"secret":"letmein"}`
  );
});

// POST route
app.post('/', (req, res) => {
  const { secret } = req.body;
  if (secret === 'letmein') {
    res.type('text/plain').send('Congratulations agent.\nFLAG: CTF{http_post_master}');
  } else {
    res.status(403).type('text/plain').send('Access Denied. Wrong secret.');
  }
});

// Catch all other methods
app.all('*', (req, res) => {
  res.status(405).type('text/plain').send('Method Not Allowed');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
    