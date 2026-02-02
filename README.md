# UTRA-Hacks

**Voice-controlled 3D robot exploration — powered by cutting-edge AI.**

## What's in this repo

- **lib/** – Arduino sketches: IR, ultrasonic, color, motors, servo, line follow.
- **showcase/robot-viewer/** – Web app: 3D robot, voice/text search (ElevenLabs + Gemini).
- **robot_demo/** – Full robot challenges (line follow, obstacle, target).
- **test/** – Test sketches for color sensor and line follow.

An interactive 3D robot model viewer where you can *speak* to explore. Ask "show me the brain" or "where's the wireless module?" and watch the model highlight the right parts. It's hands-free, intuitive, and built with a unique AI pipeline that turns speech into insight.

---

## The Robot

<div align="center">
  <table>
    <tr>
      <td><img src="showcase/robot-viewer/client/public/bot1.png" width="300" /></td>
      <td><img src="showcase/robot-viewer/client/public/bot2.png" width="300" /></td>
      <td><img src="showcase/robot-viewer/client/public/bot3.png" width="300" /></td>
    </tr>
    <tr>
      <td><img src="showcase/robot-viewer/client/public/bot4.png" width="300" /></td>
      <td><img src="showcase/robot-viewer/client/public/bot5.png" width="300" /></td>
      <td><img src="showcase/robot-viewer/client/public/bot6.png" width="300" /></td>
    </tr>
    <tr>
      <td colspan="3" align="center"><img src="showcase/robot-viewer/client/public/real.jpeg" width="400" /></td>
    </tr>
  </table>
</div>

---

## What Makes It Unique

We combine **ElevenLabs Speech-to-Text** and **Google Gemini** into a single voice-to-result pipeline. Most demos use either voice input or AI understanding — we use both. Say what you want, and the system transcribes, reasons, and highlights the matching robot parts in one smooth flow. It’s a pretty unique way to explore technical systems.

---

## How We Use ElevenLabs

**ElevenLabs Scribe V2** turns your voice into accurate text.

1. **Audio capture** — The frontend records from your microphone (WebM/WAV).
2. **Streaming upload** — Audio is sent to our Express backend.
3. **Transcription** — The backend calls ElevenLabs Scribe V2 for high-accuracy transcription.
4. **Pipeline handoff** — The transcribed text is passed straight to Gemini for part identification.

ElevenLabs gives strong accuracy for technical terms and accents, handles multiple audio formats, and completes in under ~2 seconds — ideal for real-time interaction.

---

## How We Use Gemini

**Google Gemini 2.5 Flash** is the reasoning layer that maps natural language to robot parts.

1. **Semantic matching** — Queries like "Show me the part that controls speed" or "Where is the wireless communication module?" are analyzed against our robot parts database to find the most relevant components.
2. **Context-aware understanding** — Gemini handles synonyms and context: "brain" → microcontroller, "wireless communication" → WiFi/Bluetooth, "movement" → motors and actuators.
3. **Structured output** — A custom prompt produces validated JSON: `partIds`, `confidence`, and `reasoning` so we can highlight parts and explain why they were chosen.
4. **Graceful fallback** — Without API keys, the app switches to keyword-based demo mode.

Gemini 2.5 Flash is fast (sub-second), cost-efficient, and works without training — perfect for hackathon-scale apps.

---

## The Combined Pipeline

```
Voice Input → ElevenLabs Transcription → Gemini Analysis → Part Highlighting
```

The result: hands-free exploration, semantic search instead of exact keywords, and explanations for why parts were matched.

---

## Features

- Interactive 3D robot with clickable parts
- Voice commands via ElevenLabs Speech-to-Text
- Natural language queries via Google Gemini
- Text search and category filtering
- Part highlighting with glow effects

---

## Quick Setup

From the repo root:

```bash
cd showcase/robot-viewer
cd client && npm install
cd ../server && npm install
```

**Terminal 1 — Backend:**
```bash
cd showcase/robot-viewer/server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd showcase/robot-viewer/client
npm run dev
```

Open **http://localhost:5173**. The app runs in demo mode without API keys; add `ELEVENLABS_API_KEY` and `GEMINI_API_KEY` to `server/.env` for full AI features.

---

## Clean Code

We practice **clean code** and keep the codebase structured and easy to work with:

- **Descriptive and clear comments** — We comment where it helps understanding, not noise.
- **Clear structure** — Files and folders are organized by purpose; we follow conventions and naming that make sense.
- **Readable and understandable** — We aim for code that any teammate can follow. If something isn’t clear, we **rename it** (and we ask before renaming, so nothing changes without agreement).

---

## Tech Stack

- React + Vite + TypeScript
- Three.js (@react-three/fiber + @react-three/drei)
- Express + Node.js
- Zustand (state) + Tailwind CSS (styling)
- **Google Gemini 2.5 Flash** (natural language understanding)
- **ElevenLabs Scribe V2** (speech-to-text).
