// ─────────────────────────────────────────────────────────────────────────────
// app.ts
// Express application factory.
// Kept separate from server.ts so tests can import the app without starting
// a real TCP server (supertest creates its own ephemeral server internally).
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import taskRoutes from './routes/task.routes';             // all /api/tasks/* routes
import { errorHandler } from './middleware/error.middleware'; // catches next(err) calls

// Create the Express application instance
const app = express();

// ── Built-in body parsers ──────────────────────────────────────────────────────
// Parses incoming JSON bodies – required for POST/PUT requests
app.use(express.json());
// Parses URL-encoded form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// ── Health check endpoint ────────────────────────────────────────────────────
// Used by Docker HEALTHCHECK, Kubernetes liveness probes, and load balancers.
// Returns 200 so the orchestrator knows the process is alive.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────────────────────────
// Mount the task router at /api/tasks.
// All routes defined in task.routes.ts become relative to this prefix.
app.use('/api/tasks', taskRoutes);

// ── Central error handler ─────────────────────────────────────────────────────
// MUST be registered AFTER all routes so only errors that escaped the
// controllers arrive here. Handles Prisma errors and unexpected crashes.
app.use(errorHandler);

// Export the configured app (without starting the server)
export default app;
