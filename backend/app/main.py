
from contextlib import asynccontextmanager
from pathlib import Path
import sqlite3
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "echovault.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                person TEXT NOT NULL DEFAULT '',
                category TEXT NOT NULL DEFAULT 'Reflections',
                date TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="EchoVault API",
    description="A home for memories that deserve to live on.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MemoryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    person: str = Field(default="", max_length=150)
    category: str = Field(default="Reflections", max_length=50)
    date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    content: str = Field(min_length=1, max_length=20000)


@app.get("/")
def home():
    return {
        "app": "EchoVault",
        "message": "Your memory archive API is alive."
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/memories", status_code=201)
def create_memory(memory: MemoryCreate):
    memory_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO memories
            (id, title, person, category, date, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                memory_id,
                memory.title.strip(),
                memory.person.strip(),
                memory.category,
                memory.date,
                memory.content.strip(),
                created_at,
            ),
        )

        saved = conn.execute(
            "SELECT * FROM memories WHERE id = ?",
            (memory_id,),
        ).fetchone()

    return dict(saved)


@app.get("/memories")
def list_memories():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM memories ORDER BY created_at DESC"
        ).fetchall()

    return [dict(row) for row in rows]


@app.get("/memories/{memory_id}")
def get_memory(memory_id: str):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM memories WHERE id = ?",
            (memory_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Memory not found")

    return dict(row)



@app.put("/memories/{memory_id}")
def update_memory(memory_id: str, memory: MemoryCreate):
    with get_connection() as conn:
        existing = conn.execute(
            "SELECT id FROM memories WHERE id = ?",
            (memory_id,),
        ).fetchone()

        if existing is None:
            raise HTTPException(
                status_code=404,
                detail="Memory not found",
            )

        conn.execute(
            """
            UPDATE memories
            SET title = ?,
                person = ?,
                category = ?,
                date = ?,
                content = ?
            WHERE id = ?
            """,
            (
                memory.title.strip(),
                memory.person.strip(),
                memory.category,
                memory.date,
                memory.content.strip(),
                memory_id,
            ),
        )

        updated = conn.execute(
            "SELECT * FROM memories WHERE id = ?",
            (memory_id,),
        ).fetchone()

    return dict(updated)



@app.delete("/memories/{memory_id}")
def delete_memory(memory_id: str):
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM memories WHERE id = ?",
            (memory_id,),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Memory not found",
            )

    return {"message": "Memory deleted successfully", "id": memory_id}
