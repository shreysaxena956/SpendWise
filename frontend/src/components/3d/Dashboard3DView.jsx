import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';

import {
  getDashboardSummary,
  getMonthlyReport,
  getCategoryWiseReport
} from '../../services/api';

import Scene3D from './Scene3D';
import HUDOverlay from './HUDOverlay';
import './dashboard3d.css';

/**
 * ============================================================================
 * SpendWise – Interactive 3D Financial Dashboard Main Container
 * ============================================================================
 * Orchestrates:
 * 1. Fetching real financial data from existing SpendWise REST APIs
 * 2. Three.js / React Three Fiber 3D Canvas rendering
 * 3. Camera modes (Overview, Summary, Monthly, Categories, Trends)
 * 4. Interactive HUD controls, inspection drawer, and camera reset
 * 5. Navigation back to the standard 2D dashboard
 * ============================================================================
 */
export default function Dashboard3DView({ onBackToDashboard, showNotification }) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // Real financial data states
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyReportData, setMonthlyReportData] = useState(null);
  const [categoryReportData, setCategoryReportData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Active camera preset: 'overview' | 'summary' | 'monthly' | 'categories' | 'trends'
  const [activeMode, setActiveMode] = useState('overview');
  const [resetTrigger, setResetTrigger] = useState(0);

  // Hover / Clicked 3D element currently inspected in HUD
  const [inspectedItem, setInspectedItem] = useState(null);

  // Fetch real financial data concurrently
  const loadFinancialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [dash, monthly, category] = await Promise.all([
        getDashboardSummary({ year: selectedYear, month: selectedMonth }),
        getMonthlyReport(selectedYear, selectedMonth),
        getCategoryWiseReport({ type: 'Expense', year: selectedYear, month: selectedMonth })
      ]);

      setDashboardData(dash);
      setMonthlyReportData(monthly);
      setCategoryReportData(category);
    } catch (err) {
      console.error('Failed to load 3D financial dashboard data:', err);
      setErrorMessage(
        err.message || 'Could not connect to SpendWise backend. Ensure Express server is running on port 5000.'
      );
      if (showNotification) {
        showNotification('Failed to fetch 3D dashboard data.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, showNotification]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // Handle resetting camera
  const handleResetCamera = () => {
    setActiveMode('overview');
    setResetTrigger((prev) => prev + 1);
  };

  // Select camera preset mode
  const handleSelectMode = (mode) => {
    setActiveMode(mode);
  };

  return (
    <div className="dashboard-3d-container">
      {/* 1. Loading Overlay Screen */}
      {isLoading && (
        <div className="hud-loading-screen">
          <div className="cyber-spinner" />
          <div className="hud-loading-text">Initializing 3D Financial Space...</div>
          <div className="hud-loading-sub">
            Fetching real metrics from SpendWise PostgreSQL / Prisma backend
          </div>
        </div>
      )}

      {/* 2. Error Screen with Retry */}
      {errorMessage && !isLoading && (
        <div className="hud-loading-screen">
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚠️</div>
          <div className="hud-loading-text" style={{ color: '#f87171' }}>
            Data Retrieval Error
          </div>
          <p style={{ color: '#94a3b8', maxWidth: '440px', textAlign: 'center', fontSize: '13px' }}>
            {errorMessage}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="hud-btn hud-btn-primary"
              onClick={loadFinancialData}
            >
              🔄 Retry Connection
            </button>
            <button
              type="button"
              className="hud-btn hud-btn-secondary"
              onClick={onBackToDashboard}
            >
              ⬅ Return to 2D Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 3. Three.js / React Three Fiber Canvas */}
      {!errorMessage && (
        <div className="dashboard-3d-canvas-wrapper">
          <Canvas
            shadows
            camera={{ position: [0, 3.5, 14.5], fov: 50 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          >
            <Scene3D
              dashboardData={dashboardData}
              monthlyReportData={monthlyReportData}
              categoryReportData={categoryReportData}
              activeMode={activeMode}
              resetTrigger={resetTrigger}
              onInspect={setInspectedItem}
            />
          </Canvas>
        </div>
      )}

      {/* 4. Glassmorphism HUD Overlay (Top bar, Inspector, Hints) */}
      {!errorMessage && (
        <HUDOverlay
          onBackToDashboard={onBackToDashboard}
          activeMode={activeMode}
          onSelectMode={handleSelectMode}
          onResetCamera={handleResetCamera}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          inspectedItem={inspectedItem}
          onCloseInspector={() => setInspectedItem(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
