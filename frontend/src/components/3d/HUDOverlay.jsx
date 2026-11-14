import React from 'react';

/**
 * ============================================================================
 * SpendWise – 3D HUD (Head-Up Display) Overlay Component
 * ============================================================================
 * Clean glassmorphism overlay providing:
 * 1. Top bar: Back to Dashboard, 3D Brand, Camera Presets, Filters
 * 2. Interactive Element Inspector Card (shows details when hovering/clicking 3D elements)
 * 3. Bottom controls and mouse navigation hints
 * ============================================================================
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function HUDOverlay({
  onBackToDashboard,
  activeMode,
  onSelectMode,
  onResetCamera,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  inspectedItem,
  onCloseInspector,
  isLoading
}) {
  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <>
      {/* Top HUD Bar */}
      <header className="hud-top-bar hud-glass">
        {/* Brand */}
        <div className="hud-brand">
          <div className="hud-logo">💎</div>
          <div className="hud-title-group">
            <h2>
              SpendWise <span className="hud-badge-3d">3D Studio</span>
            </h2>
            <p>Interactive 3D Financial Dashboard • Desktop View</p>
          </div>
        </div>

        {/* View Focus Mode Presets */}
        <div className="hud-camera-modes">
          {[
            { id: 'overview', label: 'Overview', icon: '🌌' },
            { id: 'summary', label: 'Summary', icon: '💵' },
            { id: 'monthly', label: 'Monthly', icon: '📊' },
            { id: 'categories', label: 'Categories', icon: '🏷️' },
            { id: 'trends', label: 'Trends', icon: '📈' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`hud-mode-btn ${activeMode === mode.id ? 'active' : ''}`}
              onClick={() => onSelectMode(mode.id)}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Filter Controls & Action Buttons */}
        <div className="hud-controls-group">
          {/* Month Selector */}
          <select
            className="hud-select"
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
            title="Filter by Month"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            className="hud-select"
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            title="Filter by Year"
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Reset Camera Button */}
          <button
            type="button"
            className="hud-btn hud-btn-secondary"
            onClick={onResetCamera}
            title="Reset 3D camera to default position"
          >
            <span>🎥</span>
            <span>Reset View</span>
          </button>

          {/* Return to 2D Dashboard Button */}
          <button
            type="button"
            className="hud-btn hud-btn-back"
            onClick={onBackToDashboard}
            title="Return to standard 2D dashboard"
          >
            <span>⬅</span>
            <span>Exit 3D</span>
          </button>
        </div>
      </header>

      {/* Interactive Element Inspector Drawer (Pops up when a 3D element is hovered/selected) */}
      {inspectedItem && (
        <aside className="hud-inspector-card hud-glass">
          <div className="inspector-header">
            <span className="inspector-badge">
              <span>{inspectedItem.icon || '📌'}</span>
              <span>{inspectedItem.type || 'Data Node'}</span>
            </span>
            <button
              type="button"
              className="inspector-close"
              onClick={onCloseInspector}
              aria-label="Close Inspector"
            >
              ✕
            </button>
          </div>

          <div className="inspector-title">{inspectedItem.title}</div>

          <div className={`inspector-value ${inspectedItem.type || ''}`}>
            {inspectedItem.type === 'income'
              ? '+'
              : inspectedItem.type === 'expense'
              ? '-'
              : ''}
            {formatCurrency(inspectedItem.amount)}
          </div>

          <p className="inspector-desc">{inspectedItem.description}</p>

          <div className="inspector-metrics-grid">
            <div className="inspector-metric-item">
              <span className="inspector-metric-label">Status</span>
              <span className="inspector-metric-val" style={{ color: '#38bdf8' }}>
                Active Live Data
              </span>
            </div>
            <div className="inspector-metric-item">
              <span className="inspector-metric-label">Source</span>
              <span className="inspector-metric-val">PostgreSQL / Prisma</span>
            </div>
          </div>
        </aside>
      )}

      {/* Bottom Controls & Navigation Hints */}
      <footer className="hud-bottom-bar hud-glass">
        <div className="hud-mouse-hints">
          <div className="hint-pill">
            <span className="hint-key">Left Drag</span>
            <span>Rotate 3D Orbit</span>
          </div>
          <div className="hint-pill">
            <span className="hint-key">Scroll</span>
            <span>Zoom In / Out</span>
          </div>
          <div className="hint-pill">
            <span className="hint-key">Right Drag</span>
            <span>Pan Camera</span>
          </div>
          <div className="hint-pill">
            <span className="hint-key">Hover / Click</span>
            <span>Inspect 3D Elements</span>
          </div>
        </div>

        <div style={{ pointerEvents: 'auto', fontSize: '11px', color: '#64748b' }}>
          SpendWise Desktop Engine • Three.js + R3F
        </div>
      </footer>
    </>
  );
}
