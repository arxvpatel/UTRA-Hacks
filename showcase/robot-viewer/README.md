# Voice-Controlled 3D Robot Viewer

Interactive 3D robot model viewer with voice commands and AI-powered part identification.

## Quick Start

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure API keys (optional)

```bash
cp .env.example server/.env
# Edit server/.env with your API keys
```

The app works in **demo mode** without API keys — voice/text queries use keyword matching instead of AI.

### 3. Run

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open http://localhost:5173

## Features

- Interactive 3D robot with clickable parts
- Voice commands via ElevenLabs Speech-to-Text
- Natural language queries via Google Gemini
- Text search and category filtering
- Part highlighting with glow effects

## AI Integration: How We Use Gemini & ElevenLabs

This project leverages two cutting-edge AI services to create a seamless voice-to-insight pipeline for robot part identification.

### Google Gemini 2.5 Flash

**What it does:** Gemini serves as the intelligent brain that understands natural language queries and maps them to specific robot parts.

**How we integrate it:**

1. **Smart Part Matching** - When a user asks "Show me the part that controls speed" or "Where is the wireless communication module?", Gemini analyzes the query against our robot parts database and identifies the most relevant components.

2. **Context-Aware Understanding** - Unlike simple keyword matching, Gemini understands synonyms, technical terminology, and contextual relationships. For example, it knows that "brain" refers to the microcontroller, "wireless communication" could mean WiFi or Bluetooth modules, and "movement" relates to motors and actuators.

3. **Structured JSON Responses** - We designed a custom prompt that instructs Gemini to return validated JSON with:
   - `partIds`: Array of matched robot part IDs (1-5 most relevant)
   - `confidence`: Score from 0.0 to 1.0 indicating match quality
   - `reasoning`: Brief explanation of why these parts were selected

4. **Graceful Fallback** - If API keys aren't configured, the system automatically switches to a keyword-based mock implementation, ensuring the app remains functional in demo mode.

**Why Gemini is good for this:**

- **Lightning Fast**: Gemini 2.5 Flash provides near-instant responses (<1 second), crucial for real-time voice interactions
- **Cost-Effective**: Flash model is optimized for high-volume queries at minimal cost
- **Multimodal Potential**: While we currently use text, Gemini's multimodal capabilities open doors for future image-based part identification
- **Accurate Intent Understanding**: It correctly interprets vague or colloquial queries that would fail with traditional search
- **No Training Required**: Works out-of-the-box with prompt engineering, eliminating the need for custom ML model training

### ElevenLabs Speech-to-Text (Scribe V2)

**What it does:** ElevenLabs converts voice recordings into accurate text transcriptions that Gemini can process.

**How we integrate it:**

1. **Audio Capture** - The frontend captures audio from the user's microphone using the Web Audio API, encoded as WebM or WAV format.

2. **Streaming Upload** - Audio buffers are sent to our Express backend via multipart form data (using Multer middleware).

3. **Transcription API** - The backend forwards the audio to ElevenLabs Scribe V2 model, which returns high-accuracy text transcription.

4. **Pipeline Integration** - The transcribed text is immediately passed to Gemini for part identification, creating a seamless voice-to-result pipeline:
   ```
   Voice Input → ElevenLabs Transcription → Gemini Analysis → Part Highlighting
   ```

5. **Mock Mode** - Without API keys, the system randomly selects from a curated list of sample queries for demonstration purposes.

**Why ElevenLabs is good for this:**

- **Best-in-Class Accuracy**: ElevenLabs Scribe V2 delivers superior transcription accuracy, especially for technical terminology and accents
- **Fast Processing**: Typical transcription completes in <2 seconds for short voice queries
- **Format Flexibility**: Handles multiple audio formats (WebM, WAV, MP3) without preprocessing
- **Technical Language Support**: Better at recognizing robotics/engineering terms compared to generic STT services
- **Simple API**: Single endpoint with minimal configuration—just upload audio and receive text
- **No Model Training**: Works immediately without custom vocabulary or acoustic model training

### The Power of Combined AI

The synergy between ElevenLabs and Gemini creates a natural, intuitive user experience:

1. **Hands-Free Operation**: Users can explore the 3D robot model completely hands-free, ideal for educational demonstrations or multitasking scenarios.

2. **Semantic Search**: Instead of memorizing exact part names, users can describe functionality ("What handles power distribution?") and get accurate results.

3. **Educational Value**: The `reasoning` field returned by Gemini helps users learn by explaining why certain parts were matched.

4. **Accessibility**: Voice commands make the interface accessible to users with mobility limitations or in situations where typing is inconvenient.

5. **Scalability**: Both services handle thousands of requests effortlessly, making this architecture production-ready.

### Technical Implementation Details

**Backend Architecture** (`server/src/`):

- `services/elevenlabs.ts`: Handles audio transcription with ElevenLabs API
- `services/gemini.ts`: Manages Gemini AI queries with custom prompts
- `routes/voice.ts`: Express endpoints that orchestrate the AI pipeline
- Graceful degradation with mock implementations when API keys are missing

**Key Code Flow**:

```
1. User clicks record → Frontend captures audio
2. Audio uploaded to POST /api/voice/process
3. ElevenLabs transcribes audio → text
4. Gemini analyzes text → matched part IDs + confidence + reasoning
5. Backend enriches with full part details
6. Frontend highlights matched parts in 3D viewer
```

**Configuration**:

Both services require API keys set in `server/.env`:
```
ELEVENLABS_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

Check real-time API status via `GET /api/voice/status` endpoint.

## API Keys

| Service | Get key at |
|---------|-----------|
| ElevenLabs | https://elevenlabs.io → Profile → API Keys |
| Google Gemini | https://makersuite.google.com/app/apikey |

## Hosting

You can host the app in two ways: **single server** (client + API on one URL) or **split** (frontend and backend on different hosts).

### Option A: Single server (recommended for hackathon / simple deploy)

Build the client and serve it from the Express server so one URL serves everything.

**One command** (from `robot-viewer/` — builds client, copies to `server/public`, builds server):
```bash
cd server && npm run build:full && npm start
```

Or step by step:
1. `cd client && npm run build`
2. Copy build into server: `cp -r client/dist server/public` (Windows: `Copy-Item -Recurse client\dist server\public`)
3. `cd server && npm run build && npm start`

**Environment variables** (in `server/.env`):
- `PORT` — port to listen on (default `3001`)
- `ELEVENLABS_API_KEY`, `GEMINI_API_KEY` — optional; app works in demo mode without them
- `CLIENT_URL` — leave unset when using single server (same origin)

**Deploy (Railway, Render, Fly.io):** Set root to `showcase/robot-viewer`. Build command: `cd server && npm run build:full`. Start command: `cd server && npm start`. Set `PORT` if required.

### Option B: Split (frontend and backend on different hosts)

Host the client on Vercel/Netlify/Cloudflare Pages and the API on Railway/Render/Fly.io.

1. **Backend:** Deploy the `server/` folder. Set in env:
   - `PORT` (if needed)
   - `CLIENT_URL` = your frontend URL (e.g. `https://your-app.vercel.app`) for CORS
   - `ELEVENLABS_API_KEY`, `GEMINI_API_KEY` (optional)

2. **Frontend:** Deploy the `client/` folder. Set build env:
   - `VITE_API_URL` = your API base URL (e.g. `https://your-api.railway.app/api`)
   - Build: `npm run build`; output: `dist`

3. The client uses `VITE_API_URL` when set, otherwise `/api` (same origin).

### Railway (API) + Vercel (frontend)

**1. Deploy the API on Railway**

- Create a new project → **Deploy from GitHub repo** (or add the repo).
- Set **Root Directory** to `UTRA-Hacks/showcase/robot-viewer/server` (or `showcase/robot-viewer/server` depending on repo structure).
- Railway sets `PORT` automatically; no need to add it.
- **Variables** (in Railway project → Variables):
  - `CLIENT_URL` = your Vercel URL **without** trailing slash, e.g. `https://your-app.vercel.app`  
    The server also allows **any** origin ending with `.vercel.app` (so preview URLs work without updating this).
  - Optional: `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- Deploy, then copy the **public URL** Railway gives you (e.g. `https://robot-viewer-api-production-xxxx.up.railway.app`).

**2. Deploy the frontend on Vercel**

- Import the same repo → **Configure Project**.
- Set **Root Directory** to `UTRA-Hacks/showcase/robot-viewer/client` (or `showcase/robot-viewer/client`).
- **Environment Variables** (add for Production, and optionally Preview):
  - `VITE_API_URL` = Railway API URL **including** `/api`, e.g. `https://robot-viewer-api-production-xxxx.up.railway.app/api`
- **Build Command:** `npm run build` (default)
- **Output Directory:** `dist` (default for Vite)
- Deploy. Your app will be at `https://your-project.vercel.app` and will call the Railway API.

**Order:** Deploy Railway first so you have the API URL, then set `VITE_API_URL` on Vercel to that URL and deploy. If you deploy Vercel first, add `VITE_API_URL` after Railway is live and trigger a redeploy.

**API works on `/health` but frontend still gets 404?** The frontend is calling your Vercel URL (e.g. `https://your-app.vercel.app/api/...`) instead of Railway. Set **`VITE_API_URL`** in Vercel to your Railway URL **including `/api`**, e.g. `https://your-backend.up.railway.app/api`, then **redeploy** the Vercel project so the client is rebuilt with that value. (Vite bakes env vars in at build time.)

### Railway not starting? (what to check / paste)

The server already uses `process.env.PORT`, binds to `0.0.0.0`, and has a build step. If Railway still fails:

1. **Health check** (replace with your Railway URL):
   ```bash
   curl -i https://your-backend.up.railway.app/health
   ```
   You should get `200` and `{"status":"ok",...}`. Also try `/api/health`.

2. **Local run** (from `server/`):
   ```bash
   npm install
   npm run build
   PORT=3000 npm start
   ```
   On Windows PowerShell: `$env:PORT=3000; npm start`

3. **What to paste** if you need help:
   - Last 20–50 lines of Railway **Deploy** or **Build** logs.
   - Your `server/package.json` **scripts** section.
   - The exact error from Railway logs or browser DevTools (Console / Network).

**Quick checks in this repo:** `PORT` is read from env (default `3001`), `"start": "node dist/index.js"`, build runs `tsc` (via `prestart` or Railway build command). Required env vars have defaults (demo mode); set `CLIENT_URL` for CORS when using Vercel.

### Getting 404?

- **404 on the main page (blank or “Client not built”)** — The server has no `server/public` folder. Run the full build so the client is copied: from `robot-viewer/`, run `cd server && npm run build:full`, then start the server.
- **404 on API calls** (e.g. parts or voice) — You’re using split hosting: the frontend is on a different domain and is requesting `/api` on its own domain (which has no API). Set **`VITE_API_URL`** in the frontend build env to your backend URL including `/api`, e.g. `https://your-backend.railway.app/api`. Rebuild and redeploy the client.

## Tech Stack

- React + Vite + TypeScript
- Three.js (@react-three/fiber + @react-three/drei)
- Express + Node.js
- Zustand (state) + Tailwind CSS (styling)
- **Google Gemini 2.5 Flash** (natural language understanding)
- **ElevenLabs Scribe V2** (speech-to-text)