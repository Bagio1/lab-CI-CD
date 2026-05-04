// ─────────────────────────────────────────────────────────────────────────────
// server.ts
// Application entry point: binds the Express app to a TCP port.
// Kept minimal so app.ts (pure Express config) can be imported in tests
// without a real server starting up.
// ─────────────────────────────────────────────────────────────────────────────
import app from './app';

// Read PORT from the environment variable; fall back to 3000 for local dev
const PORT = process.env.PORT ?? 3000;

// Start the HTTP server and log confirmation once the port is bound
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
