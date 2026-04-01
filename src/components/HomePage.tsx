import { useState, useEffect } from "react";

const tasks = [
  {
    id: "1",
    title: "Сума двох чисел",
    description: "Напишіть функцію sum(a, b), яка повертає суму двох чисел",
    difficulty: "Легка",
    completed: true,
    icon: "∑",
    accent: "#00e5ff",
  },
  {
    id: "2",
    title: "Перевернути рядок",
    description: "Напишіть функцію reverseString(str), яка перевертає рядок",
    difficulty: "Легка",
    completed: false,
    icon: "⇄",
    accent: "#00e5ff",
  },
  {
    id: "3",
    title: "Факторіал числа",
    description: "Напишіть функцію factorial(n), яка обчислює факторіал числа",
    difficulty: "Середня",
    completed: false,
    icon: "n!",
    accent: "#ffb300",
  },
  {
    id: "4",
    title: "Перевірка на паліндром",
    description: "Визначте чи є слово паліндромом",
    difficulty: "Середня",
    completed: false,
    icon: "⟲",
    accent: "#ffb300",
  },
  {
    id: "5",
    title: "FizzBuzz",
    description: "Реалізуйте класичну задачу FizzBuzz",
    difficulty: "Легка",
    completed: false,
    icon: "fb",
    accent: "#00e5ff",
  },
  {
    id: "6",
    title: "Бінарний пошук",
    description: "Реалізуйте алгоритм бінарного пошуку",
    difficulty: "Важка",
    completed: false,
    icon: "⌖",
    accent: "#ff4d6d",
  },
];

const difficultyConfig = {
  Легка: { label: "Легка", color: "#00e5ff", bg: "rgba(0,229,255,0.08)" },
  Середня: { label: "Середня", color: "#ffb300", bg: "rgba(255,179,0,0.08)" },
  Важка: { label: "Важка", color: "#ff4d6d", bg: "rgba(255,77,109,0.08)" },
};

function TaskCard({ task, index, onOpen }) {
  const diff = difficultyConfig[task.difficulty] || difficultyConfig["Легка"];

  return (
    <div
      onClick={() => onOpen(task)}
      style={{
        animationDelay: `${index * 80}ms`,
        "--accent": diff.color,
      }}
      className="task-card"
    >
      <div className="card-inner">
        {/* Glow border top */}
        <div className="card-glow-line" style={{ background: diff.color }} />

        <div className="card-header">
          <div className="card-icon" style={{ color: diff.color, borderColor: `${diff.color}30` }}>
            {task.icon}
          </div>
          {task.completed && (
            <div className="completed-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Виконано
            </div>
          )}
        </div>

        <h3 className="card-title">{task.title}</h3>
        <p className="card-desc">{task.description}</p>

        <div className="card-footer">
          <span
            className="diff-badge"
            style={{ color: diff.color, background: diff.bg, borderColor: `${diff.color}30` }}
          >
            {diff.label}
          </span>
          <div className="card-arrow" style={{ color: diff.color }}>
            →
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsBar({ tasks }) {
  const completed = tasks.filter((t) => t.completed).length;
  const pct = Math.round((completed / tasks.length) * 100);

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-num">{tasks.length}</span>
        <span className="stat-label">Задач</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-num" style={{ color: "#00e5ff" }}>{completed}</span>
        <span className="stat-label">Виконано</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-num" style={{ color: "#ffb300" }}>{tasks.length - completed}</span>
        <span className="stat-label">Залишилось</span>
      </div>
      <div className="progress-wrap">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="progress-pct">{pct}%</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [filter, setFilter] = useState("Всі");
  const [mounted, setMounted] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const filters = ["Всі", "Легка", "Середня", "Важка", "Виконані"];

  const filtered = tasks.filter((t) => {
    if (filter === "Всі") return true;
    if (filter === "Виконані") return t.completed;
    return t.difficulty === filter;
  });

  return (
    <div className={`app ${mounted ? "mounted" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080c14;
          --surface: #0d1421;
          --surface2: #111827;
          --border: rgba(255,255,255,0.07);
          --text: #e2e8f0;
          --muted: #64748b;
          --cyan: #00e5ff;
          --gold: #ffb300;
          --red: #ff4d6d;
        }

        body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; min-height: 100vh; }

        .app { min-height: 100vh; opacity: 0; transition: opacity 0.4s ease; }
        .app.mounted { opacity: 1; }

        /* ─── HERO ─── */
        .hero {
          position: relative;
          overflow: hidden;
          padding: 0 24px;
          min-height: 340px;
          display: flex;
          align-items: flex-end;
        }

        .hero-bg {
          position: absolute; inset: 0;
          background: 
            radial-gradient(ellipse 80% 60% at 60% 0%, rgba(0,229,255,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 20% 100%, rgba(255,179,0,0.06) 0%, transparent 60%),
            linear-gradient(180deg, #0a0f1e 0%, #080c14 100%);
        }

        .hero-grid {
          position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 40%, transparent 100%);
        }

        .hero-scan {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          animation: scan 4s ease-in-out infinite;
          opacity: 0.6;
        }

        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(340px); opacity: 0; }
        }

        .hero-content {
          position: relative; z-index: 2;
          padding-bottom: 48px;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }

        .hero-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: var(--cyan);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
          animation: fadeUp 0.6s ease both;
        }

        .hero-eyebrow::before {
          content: '';
          display: block;
          width: 24px; height: 1px;
          background: var(--cyan);
        }

        .hero-title {
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .hero-title-line1 { display: block; color: var(--text); }
        .hero-title-line2 {
          display: block;
          background: linear-gradient(135deg, var(--cyan) 0%, #0099bb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          color: var(--muted);
          margin-top: 16px;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        /* ─── MAIN CONTENT ─── */
        .main {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        /* ─── STATS ─── */
        .stats-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px 28px;
          margin-bottom: 32px;
          animation: fadeUp 0.5s 0.3s ease both;
          flex-wrap: wrap;
        }

        .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .stat-num { font-family: 'Space Mono', monospace; font-size: 22px; font-weight: 700; color: var(--text); }
        .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
        .stat-divider { width: 1px; height: 36px; background: var(--border); }

        .progress-wrap {
          display: flex; align-items: center; gap: 12px; margin-left: auto;
        }
        .progress-track {
          width: 160px; height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px; overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--cyan), #0099bb);
          border-radius: 2px;
          transition: width 1s ease;
        }
        .progress-pct {
          font-family: 'Space Mono', monospace;
          font-size: 12px; color: var(--cyan);
          min-width: 36px;
        }

        /* ─── FILTERS ─── */
        .filters {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 28px;
          animation: fadeUp 0.5s 0.35s ease both;
        }

        .filter-btn {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          padding: 8px 18px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
        }
        .filter-btn:hover { border-color: var(--cyan); color: var(--cyan); }
        .filter-btn.active {
          background: rgba(0,229,255,0.1);
          border-color: var(--cyan);
          color: var(--cyan);
        }

        /* ─── SECTION HEADER ─── */
        .section-header {
          display: flex; align-items: baseline; gap: 12px;
          margin-bottom: 20px;
          animation: fadeUp 0.5s 0.4s ease both;
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--muted);
        }
        .section-count {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: var(--cyan);
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.2);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* ─── GRID ─── */
        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* ─── TASK CARD ─── */
        .task-card {
          animation: fadeUp 0.5s ease both;
          cursor: pointer;
        }

        .card-inner {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          overflow: hidden;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          height: 100%;
        }

        .task-card:hover .card-inner {
          transform: translateY(-3px);
          border-color: rgba(var(--accent), 0.3);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset;
        }

        .task-card:hover .card-inner { border-color: color-mix(in srgb, var(--accent) 30%, transparent); }

        .card-glow-line {
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          opacity: 0.6;
        }

        .card-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 16px;
        }

        .card-icon {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Mono', monospace;
          font-size: 14px; font-weight: 700;
          border: 1px solid;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
        }

        .completed-badge {
          display: flex; align-items: center; gap: 5px;
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: var(--cyan);
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.2);
          padding: 4px 10px; border-radius: 20px;
        }

        .card-title {
          font-size: 17px; font-weight: 700;
          line-height: 1.3;
          margin-bottom: 8px;
          color: var(--text);
        }

        .card-desc {
          font-size: 13px; color: var(--muted);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .card-footer {
          display: flex; align-items: center; justify-content: space-between;
        }

        .diff-badge {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid;
          letter-spacing: 0.5px;
        }

        .card-arrow {
          font-size: 18px;
          transition: transform 0.2s;
        }
        .task-card:hover .card-arrow { transform: translateX(4px); }

        /* ─── EMPTY ─── */
        .empty {
          text-align: center; padding: 60px 20px;
          color: var(--muted);
          font-family: 'Space Mono', monospace;
          font-size: 13px;
        }

        /* ─── ADD BUTTON ─── */
        .add-btn {
          display: flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,229,255,0.05));
          border: 1px dashed rgba(0,229,255,0.3);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.25s;
          color: var(--cyan);
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 600;
          width: 100%;
          justify-content: center;
          margin-top: 24px;
          animation: fadeUp 0.5s 0.5s ease both;
        }
        .add-btn:hover {
          background: rgba(0,229,255,0.12);
          border-color: rgba(0,229,255,0.5);
          transform: translateY(-2px);
        }
        .add-btn-icon {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 1.5px solid var(--cyan);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }

        /* ─── TOPBAR ─── */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          background: rgba(8,12,20,0.8);
          backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 10;
        }

        .topbar-logo {
          font-family: 'Space Mono', monospace;
          font-size: 13px; color: var(--cyan);
          display: flex; align-items: center; gap: 8px;
        }
        .topbar-logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--cyan);
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .topbar-actions { display: flex; gap: 8px; }
        .topbar-btn {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .topbar-btn:hover { border-color: rgba(255,255,255,0.15); color: var(--text); }
        .topbar-btn.primary {
          background: rgba(0,229,255,0.1);
          border-color: rgba(0,229,255,0.3);
          color: var(--cyan);
        }
        .topbar-btn.primary:hover { background: rgba(0,229,255,0.18); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .hero { min-height: 260px; padding: 0 16px; }
          .hero-content { padding-bottom: 36px; }
          .main { padding: 0 16px 60px; }
          .progress-wrap { display: none; }
          .tasks-grid { grid-template-columns: 1fr; }
          .topbar-actions .topbar-btn:not(.primary) { display: none; }
        }
      `}</style>

      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-dot" />
          JS_TASKS
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn">Імпорт</button>
          <button className="topbar-btn">Експорт</button>
          <button className="topbar-btn primary">+ Додати</button>
        </div>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-scan" />
        <div className="hero-content">
          <div className="hero-eyebrow">Тренажер алгоритмів</div>
          <h1 className="hero-title">
            <span className="hero-title-line1">Мої coding</span>
            <span className="hero-title-line2">challenges</span>
          </h1>
          <p className="hero-sub">// Обери задачу і вирішуй прямо в браузері</p>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        <StatsBar tasks={tasks} />

        {/* Filters */}
        <div className="filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="section-header">
          <span className="section-title">Задачі</span>
          <span className="section-count">{filtered.length}</span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty">// немає задач для цього фільтру</div>
        ) : (
          <div className="tasks-grid">
            {filtered.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onOpen={setActiveTask}
              />
            ))}
          </div>
        )}

        {/* Add button */}
        <button className="add-btn">
          <span className="add-btn-icon">+</span>
          Додати нову задачу
        </button>
      </div>
    </div>
  );
}
