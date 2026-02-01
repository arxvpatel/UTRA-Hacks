import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import voiceRoutes from './routes/voice.js';
import partsRoutes from './routes/parts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
// Comma-separated for multiple origins (e.g. Vercel production + preview URLs)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean)
  : ['http://localhost:5173'];

const demoMode = !process.env.ELEVENLABS_API_KEY || !process.env.GEMINI_API_KEY;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/voice', voiceRoutes);
app.use('/api/parts', partsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), demoMode });
});

// Serve built client (single-server hosting). Check both dist/../public and cwd/public.
const publicDirCandidates = [
  path.join(__dirname, '..', 'public'),
  path.join(process.cwd(), 'public'),
];
const publicDir = publicDirCandidates.find((dir) => fs.existsSync(dir));

if (publicDir) {
  app.use(express.static(publicDir, { index: 'index.html' }));
  // SPA fallback: any non-API GET that didn't match a file → index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get('/', (_req, res) => {
    res.status(404).send(
      '<h1>404 – Client not built</h1><p>Build the client and copy to <code>server/public</code>: <code>cd client && npm run build && cp -r dist ../server/public</code></p>'
    );
  });
}

app.listen(PORT, () => {
  console.log(`\n  Robot Viewer Server running on http://localhost:${PORT}`);
  if (demoMode) {
    console.log('  ⚠ Running in DEMO MODE (missing API keys)');
    console.log('  Set ELEVENLABS_API_KEY and GEMINI_API_KEY in .env for full functionality\n');
  } else {
    console.log('  All API keys configured - full functionality enabled\n');
  }
});
