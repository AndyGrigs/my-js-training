import React, { useState } from 'react';
import { Task, ConsoleOutput } from '../types';
import { SimpleEditor } from './SimpleEditor';
import { MonacoEditor } from './MonakoEditor';

interface TaskModalProps {
  task: Task | null;
  code: string;
  setCode: (code: string) => void;
  consoleOutput: ConsoleOutput[];
  onClose: () => void;
  onSave: () => void;
  onRun: () => void;
  isMobile: boolean;
  syncing: boolean;
}

type OutputTab = 'output' | 'tests' | 'debug';

const difficultyConfig: Record<string, { color: string; label: string }> = {
  Легка:   { color: '#00e5ff', label: 'Легка' },
  Середня: { color: '#ffb300', label: 'Середня' },
  Важка:   { color: '#ff4d6d', label: 'Важка' },
};

export const TaskModal: React.FC<TaskModalProps> = ({
  task, code, setCode, consoleOutput,
  onClose, onSave, onRun, isMobile, syncing,
}) => {
  const [activeTab, setActiveTab] = useState<OutputTab>('output');

  if (!task) return null;

  const diff = difficultyConfig[task.difficulty] ?? difficultyConfig['Легка'];
  const passed = consoleOutput.filter(o => o.type === 'log').length;
  const errors = consoleOutput.filter(o => o.type === 'error').length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@600;700;800&display=swap');

        .tm-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(4, 7, 14, 0.92);
          backdrop-filter: blur(8px);
          display: flex; flex-direction: column;
          font-family: 'Syne', sans-serif;
          animation: tmFadeIn 0.2s ease;
        }
        @keyframes tmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── TOPBAR ── */
        .tm-topbar {
          display: flex; align-items: center; gap: 0;
          background: #0a0f1e;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 20px;
          height: 52px;
          flex-shrink: 0;
        }
        .tm-back {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: #64748b;
          background: none; border: none; cursor: pointer;
          padding: 0 16px 0 0;
          border-right: 1px solid rgba(255,255,255,0.07);
          margin-right: 20px;
          transition: color 0.2s;
          height: 100%;
        }
        .tm-back:hover { color: #00e5ff; }
        .tm-back-arrow { font-size: 16px; }

        .tm-title-block { flex: 1; }
        .tm-task-name {
          font-size: 15px; font-weight: 700;
          color: #e2e8f0; line-height: 1;
        }
        .tm-task-meta {
          display: flex; align-items: center; gap: 8px; margin-top: 3px;
        }
        .tm-diff-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }
        .tm-diff-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: #64748b;
        }

        .tm-topbar-actions { display: flex; gap: 8px; }
        .tm-topbar-btn {
          font-family: 'Space Mono', monospace;
          font-size: 11px; padding: 7px 16px;
          border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: #64748b;
          cursor: pointer; transition: all 0.2s;
        }
        .tm-topbar-btn:hover { border-color: rgba(255,255,255,0.15); color: #e2e8f0; }
        .tm-topbar-btn.save {
          background: rgba(0,229,255,0.1);
          border-color: rgba(0,229,255,0.3);
          color: #00e5ff;
          display: flex; align-items: center; gap: 6px;
        }
        .tm-topbar-btn.save:hover { background: rgba(0,229,255,0.18); }
        .tm-topbar-btn.save:disabled { opacity: 0.5; cursor: not-allowed; }
        .tm-spin { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── TASK HEADER ── */
        .tm-header {
          background: linear-gradient(180deg, #0d1421 0%, #0a0f1e 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 20px 24px 0;
          flex-shrink: 0;
        }
        .tm-h-title {
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 800; color: #e2e8f0;
          margin-bottom: 6px;
        }
        .tm-h-accent {
          display: inline-block;
          width: 40px; height: 3px;
          border-radius: 2px;
          margin-bottom: 10px;
        }
        .tm-h-desc {
          font-size: 13px; color: #64748b;
          line-height: 1.6; padding-bottom: 16px;
          font-family: 'Space Mono', monospace;
        }

        /* file tabs */
        .tm-file-tabs {
          display: flex; gap: 0; margin-top: 4px;
        }
        .tm-file-tab {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-bottom: none;
          color: #64748b; cursor: pointer;
          transition: all 0.15s;
          border-radius: 6px 6px 0 0;
          margin-right: 2px;
        }
        .tm-file-tab.active {
          background: #111827;
          color: #e2e8f0;
          border-color: rgba(255,255,255,0.1);
        }

        /* ── EDITOR AREA ── */
        .tm-editor-row {
          display: flex; flex: 1; min-height: 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .tm-editor-pane {
          flex: 1; min-width: 0;
          background: #111827;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
        }

        .tm-editor-toolbar {
          display: flex; align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #0d1421;
          gap: 8px; flex-shrink: 0;
        }
        .tm-toolbar-icon {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
          color: #64748b; font-size: 12px; cursor: pointer;
          background: transparent; transition: all 0.15s;
        }
        .tm-toolbar-icon:hover { border-color: rgba(255,255,255,0.15); color: #e2e8f0; }
        .tm-toolbar-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.07); margin: 0 4px; }
        .tm-toolbar-right { margin-left: auto; display: flex; gap: 6px; }

        .tm-editor-inner { flex: 1; min-height: 0; overflow: hidden; }

        /* console pane (desktop) */
        .tm-console-pane {
          width: 38%;
          flex-shrink: 0;
          background: #0d1421;
          display: flex; flex-direction: column;
        }
        .tm-console-header {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: #64748b;
          letter-spacing: 1px; text-transform: uppercase;
          flex-shrink: 0;
        }
        .tm-console-body {
          flex: 1; overflow-y: auto;
          padding: 12px 16px;
          font-family: 'Space Mono', monospace;
          font-size: 12px; line-height: 1.7;
        }
        .tm-console-empty { color: #334155; font-size: 11px; }
        .tm-console-line { display: flex; gap: 8px; margin-bottom: 6px; }
        .tm-console-prompt { color: #334155; flex-shrink: 0; }
        .tm-console-log { color: #4ade80; }
        .tm-console-error { color: #f87171; }
        .tm-console-warn { color: #fbbf24; }

        /* ── OUTPUT PANEL ── */
        .tm-output-panel {
          background: #080c14;
          flex-shrink: 0;
          display: flex; flex-direction: column;
          height: 220px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .tm-output-tabs {
          display: flex; align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 16px;
          background: #0a0f1e;
          flex-shrink: 0;
        }
        .tm-output-tab {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: #64748b;
          padding: 10px 16px; cursor: pointer;
          border: none; background: none;
          border-bottom: 2px solid transparent;
          transition: all 0.15s; margin-bottom: -1px;
        }
        .tm-output-tab:hover { color: #94a3b8; }
        .tm-output-tab.active { color: #00e5ff; border-bottom-color: #00e5ff; }
        .tm-output-tab-actions { margin-left: auto; display: flex; gap: 8px; }
        .tm-output-action {
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: #334155;
          background: none; border: none; cursor: pointer;
          padding: 4px 6px;
          transition: color 0.15s;
        }
        .tm-output-action:hover { color: #64748b; }

        .tm-output-body {
          flex: 1; overflow-y: auto;
          padding: 12px 20px;
          font-family: 'Space Mono', monospace;
          font-size: 12px; line-height: 1.8; color: #94a3b8;
        }
        .tm-output-empty { color: #1e293b; font-size: 11px; padding-top: 8px; }
        .tm-output-item { display: flex; gap: 10px; margin-bottom: 4px; }
        .tm-output-arrow { color: #334155; }
        .tm-output-label { color: #475569; }
        .tm-output-value-log { color: #4ade80; }
        .tm-output-value-err { color: #f87171; }
        .tm-output-value-warn { color: #fbbf24; }

        /* ── BOTTOM BAR ── */
        .tm-bottom {
          background: #0a0f1e;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 16px 24px;
          display: flex; align-items: center; justify-content: center;
          gap: 12px; flex-shrink: 0;
        }
        .tm-run-btn {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 13px 36px;
          border-radius: 10px;
          border: none; cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .tm-run-btn.run {
          background: linear-gradient(135deg, #1d6fa4, #155f8f);
          color: #fff;
          box-shadow: 0 4px 20px rgba(29,111,164,0.4);
        }
        .tm-run-btn.run:hover {
          background: linear-gradient(135deg, #2280ba, #1a70a8);
          box-shadow: 0 6px 28px rgba(29,111,164,0.55);
          transform: translateY(-1px);
        }
        .tm-run-btn.submit {
          background: linear-gradient(135deg, #16803c, #126b33);
          color: #fff;
          box-shadow: 0 4px 20px rgba(22,128,60,0.4);
        }
        .tm-run-btn.submit:hover {
          background: linear-gradient(135deg, #19943f, #157a39);
          box-shadow: 0 6px 28px rgba(22,128,60,0.55);
          transform: translateY(-1px);
        }

        /* ── STATUS BAR ── */
        .tm-statusbar {
          background: #060a11;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 8px 24px;
          display: flex; align-items: center; gap: 24px;
          flex-shrink: 0;
        }
        .tm-status-item {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: #334155;
        }
        .tm-status-icon { font-size: 13px; }
        .tm-status-ok { color: #22c55e; }
        .tm-status-err { color: #f87171; }
        .tm-status-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.05); }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .tm-console-pane { display: none; }
          .tm-output-panel { height: 180px; }
          .tm-h-title { font-size: 18px; }
          .tm-run-btn { padding: 12px 24px; font-size: 13px; }
          .tm-statusbar { gap: 12px; flex-wrap: wrap; }
          .tm-topbar-btn:not(.save) { display: none; }
        }
      `}</style>

      <div className="tm-overlay">

        {/* Topbar */}
        <div className="tm-topbar">
          <button className="tm-back" onClick={onClose}>
            <span className="tm-back-arrow">←</span>
            Назад
          </button>
          <div className="tm-title-block">
            <div className="tm-task-name">{task.title}</div>
            <div className="tm-task-meta">
              <div className="tm-diff-dot" style={{ background: diff.color }} />
              <span className="tm-diff-label">{diff.label}</span>
              {task.completed && (
                <span className="tm-diff-label" style={{ color: '#22c55e' }}>· Виконано ✓</span>
              )}
            </div>
          </div>
          <div className="tm-topbar-actions">
            <button className="tm-topbar-btn" onClick={onClose}>Закрити</button>
            <button
              className="tm-topbar-btn save"
              onClick={onSave}
              disabled={syncing}
            >
              {syncing ? <span className="tm-spin">⟳</span> : '↑'}
              Зберегти
            </button>
          </div>
        </div>

        {/* Task header */}
        <div className="tm-header">
          <h2 className="tm-h-title">{task.title}</h2>
          <div className="tm-h-accent" style={{ background: diff.color }} />
          <p className="tm-h-desc">{task.description}</p>
          <div className="tm-file-tabs">
            <div className="tm-file-tab active">⇄ solution.js</div>
            <div className="tm-file-tab">settings</div>
            <div className="tm-file-tab">docs</div>
          </div>
        </div>

        {/* Editor row */}
        <div className="tm-editor-row">
          <div className="tm-editor-pane">
            {/* Toolbar */}
            <div className="tm-editor-toolbar">
              <button className="tm-toolbar-icon" title="Форматувати">A</button>
              <button className="tm-toolbar-icon" title="Зберегти файл">▣</button>
              <div className="tm-toolbar-sep" />
              <button className="tm-toolbar-icon" onClick={onRun} title="Запустити" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}>▶</button>
              <button className="tm-toolbar-icon" title="Очистити">⊟</button>
              <div className="tm-toolbar-right">
                <button className="tm-toolbar-icon" title="Повноекранний">⛶</button>
                <button className="tm-toolbar-icon" title="Налаштування">⚙</button>
              </div>
            </div>

            {/* Editor */}
            <div className="tm-editor-inner">
              {isMobile ? (
                <SimpleEditor value={code} onChange={setCode} onRun={onRun} />
              ) : (
                <MonacoEditor value={code} onChange={setCode} onRun={onRun} />
              )}
            </div>
          </div>

          {/* Console pane (desktop only) */}
          {!isMobile && (
            <div className="tm-console-pane">
              <div className="tm-console-header">Console</div>
              <div className="tm-console-body">
                {consoleOutput.length === 0 ? (
                  <div className="tm-console-empty">// Run code to see output…</div>
                ) : (
                  consoleOutput.map((item, i) => (
                    <div key={i} className="tm-console-line">
                      <span className="tm-console-prompt">&gt;</span>
                      <span className={
                        item.type === 'error' ? 'tm-console-error' :
                        item.type === 'warn'  ? 'tm-console-warn'  : 'tm-console-log'
                      }>{item.content}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Output panel */}
        <div className="tm-output-panel">
          <div className="tm-output-tabs">
            {(['output', 'tests', 'debug'] as OutputTab[]).map(tab => (
              <button
                key={tab}
                className={`tm-output-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <div className="tm-output-tab-actions">
              <button className="tm-output-action">&lt;&gt;</button>
              <button className="tm-output-action">⇥</button>
              <button className="tm-output-action">⚙</button>
            </div>
          </div>

          <div className="tm-output-body">
            {consoleOutput.length === 0 ? (
              <div className="tm-output-empty">// Press "Run Code" to execute…</div>
            ) : (
              consoleOutput.map((item, i) => (
                <div key={i} className="tm-output-item">
                  <span className="tm-output-arrow">&gt;</span>
                  <span className="tm-output-label">
                    {item.type === 'error' ? 'Error:' : item.type === 'warn' ? 'Warn:' : 'Output:'}
                  </span>
                  <span className={
                    item.type === 'error' ? 'tm-output-value-err' :
                    item.type === 'warn'  ? 'tm-output-value-warn' : 'tm-output-value-log'
                  }>{item.content}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Big action buttons */}
        <div className="tm-bottom">
          <button className="tm-run-btn run" onClick={onRun}>Run Code</button>
          <button className="tm-run-btn submit" onClick={onSave} disabled={syncing}>
            {syncing ? 'Saving…' : 'Submit'}
          </button>
        </div>

        {/* Status bar */}
        <div className="tm-statusbar">
          <div className="tm-status-item">
            <span className={`tm-status-icon ${errors === 0 && consoleOutput.length > 0 ? 'tm-status-ok' : errors > 0 ? 'tm-status-err' : ''}`}>
              {errors === 0 && consoleOutput.length > 0 ? '✔' : errors > 0 ? '✖' : '○'}
            </span>
            Tests Passed: {passed} / {Math.max(passed + errors, consoleOutput.length || 1)}
          </div>
          <div className="tm-status-sep" />
          <div className="tm-status-item">
            <span className="tm-status-icon">⧗</span>
            Runtime: —
          </div>
          <div className="tm-status-sep" />
          <div className="tm-status-item">
            <span className="tm-status-icon">≡</span>
            Memory Used: —
          </div>
        </div>

      </div>
    </>
  );
};
