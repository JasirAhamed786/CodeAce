# 🚀 CodeAce: AI-Powered Interview Simulator

![CodeAce Banner](https://via.placeholder.com/1000x300/0f172a/00E5FF?text=CodeAce:+Next-Gen+Interview+Prep)

**CodeAce** is a comprehensive, MERN-stack platform designed to democratize FAANG-style software engineering interview preparation. 

Traditional platforms offer static coding tests without personalized feedback, and practicing behavioral (HR) interviews is difficult without a human partner. CodeAce bridges this gap by offering an innovative **AI Virtual Compiler** for actionable architectural feedback and a **Hands-Free Voice Agent** for practicing behavioral rounds using the STAR method.

## ✨ Core Features

* **💻 AI Virtual Compiler:** Bypasses heavy backend infrastructure (like GCC/JDK) by utilizing advanced Prompt Engineering. The Gemini API acts as a strict code executor—validating syntax, rejecting mismatched languages, and simulating realistic terminal output for **Python, Java, C++, and JavaScript**.
* **🗣️ Hands-Free HR Voice Agent:** Integrates the browser's native Web Speech API (Speech-to-Text and Text-to-Speech) to create a continuous, stateful conversational loop. It uses a 2-second silence detector to auto-send candidate responses for a truly hands-free experience.
* **📊 Structured AI Analytics:** Enforces strict JSON schemas from the LLM to dynamically render beautiful, detailed scoring reports (scale of 1-100) for both technical correctness and communication skills.
* **🎨 Premium UI/UX:** Built with React, featuring a high-performance, responsive glassmorphism aesthetic and a fully integrated Monaco Code Editor.

## 🏗️ System Architecture

CodeAce utilizes a **direct-integration strategy**, bypassing heavy wrapper frameworks (like LangChain) to maintain sub-3-second response latency and granular control over prompt engineering.

* **Frontend (Client):** React, Monaco Editor, Axios, Web Speech API
* **Backend (Server):** Node.js, Express.js
* **AI Engine:** Google Gemini 1.5 Pro API (Direct REST Integration)
* **Database:** MongoDB, Mongoose

## 📂 Project Structure

CodeAce is structured as a monorepo, strictly separating the React client from the Node/Express server to ensure AI logic and API keys remain secure.

```text
codeace/
├── client/                     # FRONTEND (React)
│   ├── public/
│   └── src/
│       ├── components/         # Reusable UI (Editor, Voice Controls)
│       ├── pages/              # Main route views (TechMock, HRMock)
│       ├── services/           # Axios API calls
│       └── hooks/              # Custom hooks (e.g., useSpeechToText)
│
└── server/                     # BACKEND (Node.js + Express)
    ├── .env                    # Secrets (Mongo URI, Gemini Key)
    └── src/
        ├── controllers/        # Route handling logic
        ├── services/           # Core LLM prompt engineering & logic
        ├── models/             # Mongoose DB Schemas
        └── routes/             # API Endpoints
