
import { useEffect, useMemo, useState } from "react";
import {
  Archive, BookOpen, Plus, Search, Sparkles, Heart,
  Clock3, Feather, Moon, X, ArrowUpRight, Ghost,
  Trash2, Download, Menu, ChevronRight, Flower2, Pencil
} from "lucide-react";
import "./App.css";
import {
  checkBackend,
  fetchMemories,
  saveMemory as createMemory,
  deleteMemory as removeMemory,
  updateMemory,
} from "./api";

const starterMemories = [
  {
    id: "demo-1",
    title: "The smell of rain",
    person: "Grandmother",
    date: "2014-07-01",
    category: "Childhood",
    text: "She would sit beside the window whenever it rained, telling me stories about her childhood and making ginger tea.",
    created: Date.now() - 100000,
  },
  {
    id: "demo-2",
    title: "A letter never sent",
    person: "My younger self",
    date: "2020-01-01",
    category: "Reflection",
    text: "I wish I could tell the younger me that the difficult days would pass, and that being gentle with yourself is also a kind of courage.",
    created: Date.now() - 200000,
  },
  {
    id: "demo-3",
    title: "Marigolds at dusk",
    person: "Family",
    date: "2022-10-24",
    category: "Tradition",
    text: "Orange marigolds, little lamps, familiar voices and the feeling that every story we tell brings someone dear a little closer.",
    created: Date.now() - 300000,
  },
];

const prompts = [
  "What is a small detail about this memory you never want to forget?",
  "If this memory could speak, what would it want you to remember?",
  "Which ordinary moment became extraordinary with time?",
];

const emptyForm = {
  title: "",
  person: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Childhood",
  memoryText: "",
};

function normalizeMemory(memory) {
  return {
    ...memory,
    id: String(memory.id),
    text: memory.text ?? memory.content ?? "",
    created: memory.created ?? memory.created_at ?? Date.now(),
  };
}

function displayDate(value) {
  if (!value) return "A moment to remember";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${month}/${day}/${year}`;
  }

  return value;
}

function App() {
  const [memories, setMemories] = useState(() => {
    try {
      const saved = localStorage.getItem("echovault-memories");
      return saved ? JSON.parse(saved).map(normalizeMemory) : starterMemories;
    } catch {
      return starterMemories;
    }
  });

  const [backendStatus, setBackendStatus] = useState("checking");
  const [active, setActive] = useState("All memories");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [story, setStory] = useState("");
  const [storyMode, setStoryMode] = useState("Remembrance");
  const [storyInput, setStoryInput] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyPerson, setStoryPerson] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadBackend() {
      try {
        await checkBackend();
        const rows = await fetchMemories();

        if (cancelled) return;

        setMemories(rows.map(normalizeMemory));
        setBackendStatus("connected");
      } catch (error) {
        if (cancelled) return;

        setBackendStatus("offline");
        console.error("EchoVault backend connection failed:", error);
      }
    }

    loadBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("echovault-memories", JSON.stringify(memories));
    } catch (error) {
      console.error("Could not cache memories in this browser:", error);
    }
  }, [memories]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return memories.filter((memory) => {
      const matchesSearch = [
        memory.title,
        memory.person,
        memory.text,
        memory.category,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesCategory =
        active === "All memories" ||
        (active === "Remembrance" && memory.category === "Remembrance") ||
        (active === "Childhood" && memory.category === "Childhood") ||
        (active === "Reflections" && memory.category === "Reflection");

      return matchesSearch && matchesCategory;
    });
  }, [memories, search, active]);

  function openNewMemoryForm() {
    setEditingMemoryId(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
    setSelected(null);
  }

  function openEditMemoryForm(memory) {
    setEditingMemoryId(memory.id);
    setForm({
      title: memory.title ?? "",
      person: memory.person ?? "",
      date: memory.date ?? "",
      category: memory.category ?? "Childhood",
      memoryText: memory.text ?? "",
    });
    setSelected(null);
    setShowForm(true);
  }

  function closeMemoryForm() {
    if (saving) return;
    setShowForm(false);
    setEditingMemoryId(null);
    setForm(emptyForm);
  }

  function changeForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSaveMemory(event) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.person.trim() ||
      !form.memoryText.trim()
    ) {
      notify("Please complete the required memory fields.");
      return;
    }

    if (backendStatus !== "connected") {
      notify("Start the backend and wait for its connection before saving.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        person: form.person.trim(),
        date: form.date.trim() || new Date().toISOString().slice(0, 10),
        category: form.category,
        content: form.memoryText.trim(),
      };

      let saved;

      if (editingMemoryId) {
        saved = await updateMemory(editingMemoryId, payload);
      } else {
        saved = await createMemory(payload);
      }

      const item = normalizeMemory(saved);

      setMemories((previous) =>
        editingMemoryId
          ? previous.map((memory) =>
              memory.id === item.id ? item : memory
            )
          : [item, ...previous.filter((memory) => memory.id !== item.id)]
      );

      setShowForm(false);
      setEditingMemoryId(null);
      setForm(emptyForm);
      setActive("All memories");
      setSearch("");

      notify(
        editingMemoryId
          ? "Your changes have been saved."
          : "Your memory has been preserved in SQLite."
      );
    } catch (error) {
      console.error("Saving memory failed:", error);
      notify(
        editingMemoryId
          ? "Could not update the memory. Please try again."
          : "Could not save your memory. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMemory(id) {
    if (backendStatus !== "connected") {
      notify("Connect to the backend before deleting a memory.");
      return;
    }

    const memory = memories.find((item) => item.id === id);
    if (!memory) return;

    const confirmed = window.confirm(
      `Delete "${memory.title}" permanently from your archive?`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await removeMemory(id);

      setMemories((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setSelected(null);
      notify("Memory deleted from your archive.");
    } catch (error) {
      console.error("Deleting memory failed:", error);
      notify("Could not delete the memory. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function generateDemo() {
    if (!storyInput.trim()) {
      notify("Add a few memory details first.");
      return;
    }

    const detail = storyInput.trim().replace(/[.!?]+$/, "");
    const subject = storyPerson.trim() || "someone dear";
    const titleLine = storyTitle.trim() || "A memory worth keeping";

    const result =
      storyMode === "Remembrance"
        ? `For ${subject}\n\nSome memories do not announce their importance when they happen. They arrive quietly, hidden inside ordinary days. Yet time has a way of returning us to them.\n\n${detail}.\n\nPerhaps that is what it means to remember: not to hold the past still, but to let its warmth travel with us. In the smallest details, in the words we still hear in our minds, and in the things we carry forward, a little of what mattered remains.\n\n${titleLine} is one of those things. And it deserves to be remembered.`
        : `The Archive — Entry No. ${String(memories.length + 1).padStart(3, "0")}\n\nAt first, there was only the memory.\n\n${detail}.\n\nBut tonight, the archive was different. The old clock stopped at a minute no one remembered. A faint warmth spread across the empty room, and a page turned although every window was shut.\n\nSomewhere between what happened and what was remembered, something had been left behind.\n\nThe archive recorded one final line: “${titleLine}.”\n\nThen the light went out.`;

    setStory(result);
    notify("Demo story created. Live AI is the next milestone.");
  }

  async function copyStory() {
    if (!story) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access unavailable");
      }

      await navigator.clipboard.writeText(story);
      notify("Story copied.");
    } catch {
      notify("Copy unavailable. Select and copy the story text manually.");
    }
  }

  function exportMemory(memory) {
    const content = `# ${memory.title}\n\n**Remembered person:** ${memory.person}\n**When:** ${memory.date}\n**Collection:** ${memory.category}\n\n${memory.text}\n`;

    const url = URL.createObjectURL(
      new Blob([content], { type: "text/markdown;charset=utf-8" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download =
      `${memory.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "memory"}.md`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const navItems = [
    { label: "All memories", icon: Archive },
    { label: "Remembrance", icon: Heart },
    { label: "Childhood", icon: Flower2 },
    { label: "Reflections", icon: BookOpen },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Moon size={22} /></div>
          <div>
            <div className="brand-name">EchoVault<span>.</span></div>
            <div className="brand-caption">A HOME FOR WHAT REMAINS</div>
          </div>
          <button
            className="icon-btn mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="sidebar-label">YOUR ARCHIVE</div>
        <nav className="nav-list">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "nav-active" : ""}`}
              onClick={() => {
                setActive(label);
                setMobileMenu(false);
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === "All memories" && (
                <span className="nav-count">{memories.length}</span>
              )}
            </button>
          ))}
        </nav>

        <button
          className="new-memory-btn"
          onClick={() => {
            openNewMemoryForm();
            setMobileMenu(false);
          }}
        >
          <Plus size={17} /> Preserve a memory
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <span className="quote-mark">“</span>
            Some things are too precious to be forgotten.
            <div className="quote-flower">✳</div>
          </div>
          <div className="privacy-note">
            <span className={`privacy-dot ${backendStatus === "connected" ? "" : "offline-dot"}`} />
            <span>
              {backendStatus === "connected"
                ? "Saved in your archive"
                : backendStatus === "checking"
                  ? "Connecting to archive..."
                  : "Backend offline"}
              <br />
              <small>
                {backendStatus === "connected"
                  ? "SQLite database connected."
                  : "Start FastAPI to manage memories."}
              </small>
            </span>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            The Archive <ChevronRight size={14} /> <span>{active}</span>
          </div>
          <div className="topbar-right">
            <span className="offline-pill">
              <span />
              {backendStatus === "connected"
                ? "DATABASE CONNECTED"
                : backendStatus === "checking"
                  ? "CONNECTING"
                  : "LOCAL PREVIEW"}
            </span>
            <div className="avatar">E</div>
          </div>
        </header>

        <div className="page-content">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span /> AN ARCHIVE OF THE HEART</div>
              <h1>Memories that<br />never <em>die.</em></h1>
              <p>A quiet place for the people, moments, and stories that made you who you are.</p>
              <button className="primary-btn" onClick={openNewMemoryForm}>
                <Feather size={16} /> Preserve a memory <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="hero-art" aria-label="Illustration of a candle in a memory archive">
              <div className="art-halo" />
              <div className="art-moon">☾</div>
              <div className="art-window"><div className="window-cross" /></div>
              <div className="art-candle"><div className="flame" /><div className="wick" /><div className="candle-body" /><div className="candle-glow" /></div>
              <div className="art-book"><span>THE MEMORY<br />ARCHIVE</span></div>
              <div className="art-flower flower-one">✿</div>
              <div className="art-flower flower-two">✿</div>
              <div className="art-caption">LIGHT A CANDLE. KEEP A STORY.</div>
            </div>
          </section>

          <section className="stats-row">
            <div className="stat-card">
              <span className="stat-icon"><Archive size={17} /></span>
              <div><strong>{memories.length}</strong><small>MEMORIES KEPT</small></div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><Heart size={17} /></span>
              <div><strong>{new Set(memories.map((memory) => memory.person)).size}</strong><small>STORIES CONNECTED</small></div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><Sparkles size={17} /></span>
              <div><strong>{story ? "1" : "—"}</strong><small>STORY WEAVER</small></div>
            </div>
          </section>

          <section className="memories-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow muted-eyebrow">KEPT CLOSE, ALWAYS</div>
                <h2>Your collection<span>.</span></h2>
              </div>
              <div className="search-box">
                <Search size={16} />
                <input
                  placeholder="Search memories..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="collection-tabs">
              {["All memories", "Remembrance", "Childhood", "Reflections"].map((tab) => (
                <button
                  key={tab}
                  className={active === tab ? "tab-active" : ""}
                  onClick={() => setActive(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {filtered.length ? (
              <div className="memory-grid">
                {filtered.map((memory, index) => (
                  <article className={`memory-card card-${index % 3}`} key={memory.id}>
                    <div className="memory-card-top">
                      <span className="category-tag">{memory.category}</span>
                      <button
                        className="card-menu"
                        title="Export memory"
                        aria-label={`Export ${memory.title}`}
                        onClick={() => exportMemory(memory)}
                      >
                        <Download size={15} />
                      </button>
                    </div>
                    <div className="card-symbol">
                      {index % 3 === 0 ? "✳" : index % 3 === 1 ? "☾" : "❋"}
                    </div>
                    <h3>{memory.title}</h3>
                    <div className="memory-person"><Heart size={12} /> {memory.person}</div>
                    <p>{memory.text}</p>
                    <div className="memory-card-footer">
                      <span><Clock3 size={13} /> {displayDate(memory.date)}</span>
                      <button onClick={() => setSelected(memory)}>
                        Open memory <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Archive size={30} />
                <h3>No memories found</h3>
                <p>Try another search or preserve a new memory.</p>
                <button className="primary-btn" onClick={openNewMemoryForm}>
                  <Plus size={16} /> Add a memory
                </button>
              </div>
            )}

            <div className="archive-footer">
              <span>✳</span> Every memory is a small act of keeping. <span>✳</span>
            </div>
          </section>

          <section className="weaver-section">
            <div className="weaver-copy">
              <div className="eyebrow"><span /> THE STORY WEAVER</div>
              <h2>Let the past<br />tell its <em>story.</em></h2>
              <p>Give a memory to the archive. Turn it into a remembrance or a story from the shadows.</p>
              <div className="mode-switch">
                <button
                  className={storyMode === "Remembrance" ? "mode-active" : ""}
                  onClick={() => setStoryMode("Remembrance")}
                >
                  <Heart size={14} /> Remembrance
                </button>
                <button
                  className={storyMode === "Ghost story" ? "mode-active" : ""}
                  onClick={() => setStoryMode("Ghost story")}
                >
                  <Ghost size={14} /> Ghost story
                </button>
              </div>
              <input
                className="weaver-input"
                placeholder="A title for this story (optional)"
                value={storyTitle}
                onChange={(event) => setStoryTitle(event.target.value)}
              />
              <input
                className="weaver-input"
                placeholder="Who is this memory about? (optional)"
                value={storyPerson}
                onChange={(event) => setStoryPerson(event.target.value)}
              />
              <textarea
                className="weaver-textarea"
                placeholder={prompts[Math.floor(Date.now() / 60000) % prompts.length]}
                value={storyInput}
                onChange={(event) => setStoryInput(event.target.value)}
                rows={4}
              />
              <button className="primary-btn generate-btn" onClick={generateDemo}>
                <Sparkles size={16} /> Weave my story <ArrowUpRight size={16} />
              </button>
              <small className="demo-disclaimer">
                DEMO MODE · This story is template-generated, not AI-generated yet.
              </small>
            </div>

            <div className="story-preview">
              <div className="preview-top">
                <span><Sparkles size={14} /> A STORY FROM THE ARCHIVE</span>
                <span className="preview-dots">•••</span>
              </div>
              {story ? (
                <div className="generated-story">
                  <h3>{storyTitle || "A memory worth keeping"}</h3>
                  <p style={{ whiteSpace: "pre-wrap" }}>{story}</p>
                  <button className="text-btn" onClick={copyStory}>Copy story ↗</button>
                </div>
              ) : (
                <div className="preview-empty">
                  <div className="preview-star">✳</div>
                  <h3>Your story awaits.</h3>
                  <p>Every remembered detail holds the beginning of a story. Give it a place to begin.</p>
                  <div className="preview-line" />
                  <span>WRITTEN IN THE LANGUAGE OF MEMORY</span>
                </div>
              )}
              <div className="preview-bottom">
                <Moon size={15} /><span>ECHOVAULT · A PRIVATE ARCHIVE</span>
              </div>
            </div>
          </section>

          <footer className="footer">
            <div className="footer-brand">EchoVault<span>.</span></div>
            <span>Made with care for the things that remain.</span>
            <span>✳</span>
          </footer>
        </div>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMemoryForm();
          }}
        >
          <form className="memory-modal" onSubmit={handleSaveMemory}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">THE ARCHIVE</div>
                <h2>
                  {editingMemoryId ? "Edit your memory" : "Preserve a memory"}
                  <span>.</span>
                </h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={closeMemoryForm}
                aria-label="Close form"
              >
                <X />
              </button>
            </div>

            <p className="modal-description">
              {editingMemoryId
                ? "Make your changes below and save your updated memory."
                : "A small detail can hold an entire world. Save yours here."}
            </p>

            <label>
              Memory title
              <input
                required
                maxLength={150}
                value={form.title}
                onChange={(event) => changeForm("title", event.target.value)}
                placeholder="The afternoon we..."
              />
            </label>

            <label>
              Who is this memory about?
              <input
                required
                maxLength={150}
                value={form.person}
                onChange={(event) => changeForm("person", event.target.value)}
                placeholder="A name or nickname"
              />
            </label>

            <label>
              When did it happen?
              <input
                type="text"
                maxLength={100}
                value={form.date}
                onChange={(event) => changeForm("date", event.target.value)}
                placeholder="A date or time, e.g. Summer, 2014"
              />
            </label>

            <label>
              Collection
              <select
                value={form.category}
                onChange={(event) => changeForm("category", event.target.value)}
              >
                <option>Childhood</option>
                <option>Reflection</option>
                <option>Reflections</option>
                <option>Remembrance</option>
                <option>Tradition</option>
                <option>Love</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Your memory
              <textarea
                required
                maxLength={20000}
                value={form.memoryText}
                onChange={(event) => changeForm("memoryText", event.target.value)}
                rows={5}
                placeholder="Write it just as you remember it..."
              />
            </label>

            <button
              className="primary-btn modal-submit"
              type="submit"
              disabled={saving || backendStatus !== "connected"}
            >
              <Feather size={16} />
              {saving
                ? "Saving..."
                : editingMemoryId
                  ? "Save changes"
                  : "Keep this memory"}
              <ArrowUpRight size={16} />
            </button>
            <small className="form-privacy">
              {backendStatus === "connected"
                ? "Saved to your local SQLite database."
                : "Waiting for the backend connection."}
            </small>
          </form>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="memory-modal detail-modal">
            <div className="modal-head">
              <span className="category-tag">{selected.category}</span>
              <button
                className="icon-btn"
                onClick={() => setSelected(null)}
                aria-label="Close memory"
              >
                <X />
              </button>
            </div>
            <div className="detail-flower">✳</div>
            <h2>{selected.title}</h2>
            <div className="memory-person">
              <Heart size={13} /> {selected.person} · {displayDate(selected.date)}
            </div>
            <p className="detail-text">{selected.text}</p>
            <div className="detail-actions">
              <button className="primary-btn" onClick={() => exportMemory(selected)}>
                <Download size={15} /> Export memory
              </button>
              <button
                className="primary-btn"
                onClick={() => openEditMemoryForm(selected)}
                disabled={backendStatus !== "connected" || deletingId === selected.id}
              >
                <Pencil size={15} /> Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteMemory(selected.id)}
                disabled={deletingId === selected.id}
              >
                <Trash2 size={15} />
                {deletingId === selected.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="toast" role="status">
          <Sparkles size={16} /> {notice}
        </div>
      )}
    </div>
  );
}

export default App;
