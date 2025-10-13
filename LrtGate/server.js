import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // Import the 'path' module
import { fileURLToPath } from 'url'; // Import 'fileURLToPath' for ES modules

import { initDB } from './config/db.js';
import studentsRouter from './routes/studentsRoute.js';
import tapsRouter from './routes/tapsRoute.js';

// Helper to get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- NEW CODE TO SERVE THE FRONTEND ---
// Serve static files (like your gate-app.html) from the project's root directory
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/students', studentsRouter);
app.use('/api/taps', tapsRouter);

// --- NEW: A catch-all route to send the HTML file ---
// This ensures that visiting the root URL loads your app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'gate-app.html'));
});


initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is listening on http://localhost:${PORT}`);
    });
});

