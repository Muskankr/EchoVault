# 👻 EchoVault — A Memory Archive for the Things We Cannot Lose

> *Some memories fade. Some stories deserve to live forever.*

**EchoVault** is a personal memory archive designed to preserve meaningful moments, childhood stories, reflections, and the people who shaped our lives. It combines a calm, nostalgic interface with a backend-powered memory system, helping users capture, revisit, edit, and organize the stories they want to keep.

Built for **Hacktoberfest 2026 — Week 4: Ghost in the Machine**, EchoVault explores the intersection of memory, storytelling, and technology, with a roadmap toward open-source AI-powered storytelling.

---

## ✨ Features

- 🕯️ **Personal Memory Archive** — Create and preserve meaningful memories in one place.
- 📝 **Create & Edit Memories** — Save new entries and update existing stories.
- 🗂️ **Organized Categories** — Group memories into categories such as Remembrance, Childhood, and Reflections.
- 🔎 **Search & Filter** — Find memories using the available search and category filters.
- 🗑️ **Delete Memories** — Remove entries you no longer want to keep.
- 📖 **Story Weaver Demo** — Explore a template-based storytelling experience that transforms a memory into a story-style presentation.
- 📤 **Export Memories** — Export your memories in Markdown format for portability.
- 🗄️ **Persistent Backend Storage** — Store memory records using FastAPI and SQLite.
- 🎨 **Nostalgic User Experience** — A thoughtful interface inspired by old photographs, handwritten stories, and the feeling of revisiting the past.

> **Current AI status:** Story Weaver is currently template-generated demo functionality, not a live AI integration. Connecting an open-weight language model is a planned development milestone.

---

## 💭 Why EchoVault?

Photographs preserve what a moment looked like, but the stories behind them can be forgotten: a grandparent's advice, a childhood adventure, a friendship that changed everything, or a small moment that became unforgettable.

EchoVault aims to give those stories a home.

The project also explores how open-source AI could help people revisit and retell personal memories without making proprietary AI services a mandatory part of the experience.

### 🌱 Why open innovation matters

Open innovation makes AI more accessible to developers, students, and communities. By building on open-source tools and working toward open-weight models, EchoVault aims to explore storytelling experiences that can be inspected, adapted, and eventually run with greater user control.

The goal is not to replace human memories with AI-generated content. It is to help people preserve the details, emotions, and stories that make those memories meaningful.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Styling and responsive layouts |
| Lucide React | Interface icons |
| Python | Backend development |
| FastAPI | REST API |
| SQLite | Memory record storage |
| JavaScript | Frontend logic and API integration |

### Planned AI direction

The next milestone is to integrate an **open-weight language model** for memory-based storytelling, with an emphasis on transparent tooling and avoiding mandatory paid API dependencies. The specific model and inference setup will be documented once implemented and tested.

---

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│       EchoVault UI          │
│       React + Vite          │
│                             │
│ Create · Edit · Search      │
│ Filter · Export · Delete    │
└──────────────┬──────────────┘
               │ HTTP / REST
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
│                             │
│ Memory CRUD endpoints       │
│ Request handling            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          SQLite             │
│                             │
│ Stored memory records       │
└─────────────────────────────┘

Future: Open-weight AI storytelling
```

---

## 🚀 Getting Started

Follow these steps to run EchoVault locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) and npm
- [Python](https://www.python.org/) 3.10 or later
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Muskankr/EchoVault.git
cd EchoVault
```

Replace the repository URL above if your GitHub repository uses a different name.

### 2. Set up the backend

Open a terminal in the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows Command Prompt:

```cmd
.venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

If the project does not yet contain `requirements.txt`, install the dependencies currently used by the backend, including FastAPI and Uvicorn:

```bash
pip install fastapi uvicorn
```

Start the API:

```bash
uvicorn app.main:app --reload
```

The backend should be available at:

- API: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- Health endpoint: `http://127.0.0.1:8000/health`

Keep this terminal running.

### 3. Set up the frontend

Open a **second terminal** in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

Keep both terminals running while using the application.

---

## 🔌 API Endpoints

The FastAPI backend provides the following memory operations:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Root endpoint |
| `GET` | `/health` | Health check |
| `POST` | `/memories` | Create a memory |
| `GET` | `/memories` | Retrieve memories |
| `GET` | `/memories/{id}` | Retrieve one memory |
| `PUT` | `/memories/{id}` | Update a memory |
| `DELETE` | `/memories/{id}` | Delete a memory |

You can explore and test the endpoints through the FastAPI interactive documentation at `/docs`.

---

## 🗺️ Roadmap

- [x] Build the React-based memory archive interface
- [x] Create the FastAPI backend
- [x] Store memories using SQLite
- [x] Implement memory creation and retrieval
- [x] Add memory editing and deletion
- [x] Add search, category filtering, and Markdown export
- [x] Build a template-based Story Weaver demo

---

## 🔐 Privacy & Data

EchoVault is intended to help users keep personal memories organized.

- The current backend stores memory records in SQLite.
- Local development data is stored in the local database file.
- Do not store passwords, API keys, or other secrets inside memory entries.
- Do not commit `.env` files, credentials, or your local database containing personal information.
- Before deploying publicly, configure production CORS, secure deployment settings, and persistent storage.
- If AI storytelling is added, document clearly what memory content is sent to the model and whether processing occurs locally or on a remote service.

**Important:** The current prototype is not a fully audited privacy or security product. Avoid entering sensitive personal information until appropriate safeguards are in place.

---

## 🤝 Contributing

Contributions and constructive feedback are welcome!

You can help improve EchoVault by:

1. Opening an issue describing a bug or proposed improvement.
2. Suggesting accessible UI improvements or new ways to organize memories.
3. Improving API validation and error handling.
4. Helping integrate and test an open-weight AI model.
5. Improving documentation, tests, and deployment instructions.

For code contributions, fork the repository, create a feature branch, make your changes, and open a pull request.

Please keep contributions respectful of the project's focus on personal memories, privacy, and meaningful storytelling.

---

## 🎃 Hacktoberfest 2026 — Week 4

EchoVault is being developed for **Ghost in the Machine**, a challenge exploring open-source AI and the stories, memories, and meaning we leave behind.

The project begins with a practical memory archive and aims to explore how open-weight AI can support personal storytelling without making proprietary AI services a requirement.

**Challenge:** [Hacktoberfest Week 4 — Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)

**Project repository:**  https://github.com/Muskankr/EchoVault

---

## 👩‍💻 Author

**Muskan Kumari**

B.Tech CSE (AI & ML) student | Full-Stack Development | Exploring AI and open-source software

- GitHub: [@Muskankr](https://github.com/Muskankr)

---

## 📜 License

Choose and add an appropriate open-source license before publishing the project for reuse. Until a license file is added, do not assume that the repository grants permission to reuse, modify, or distribute its code.

---

<p align="center">
  <i>Every memory holds a story. Every story deserves a place to live.</i>
</p>
