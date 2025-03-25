const express = require('express');
const cors = require('cors');
const { registerRoutes } = require('./routes.js');
const { log, setupVite, serveStatic } = require('./vite.js');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler middleware
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  // Register API routes
  const server = await registerRoutes(app);

  // Start the server
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
  });

  // Setup Vite if not in production
  if (process.env.NODE_ENV !== 'production') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return server;
}

startServer();

// For testing
module.exports = app;