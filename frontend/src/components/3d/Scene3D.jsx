import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

import FinancialSummary3D from './FinancialSummary3D';
import MonthlyOverview3D from './MonthlyOverview3D';
import CategorySpending3D from './CategorySpending3D';
import SpendingTrends3D from './SpendingTrends3D';

/**
 * ============================================================================
 * SpendWise – 3D Scene Component (Inside R3F Canvas)
 * ============================================================================
 * Sets up lighting, cybernetic environment, particle sparkles, OrbitControls,
 * animated camera positioning presets, and mounts the 4 financial panels:
 * 1. Financial Summary Cards (Section A)
 * 2. Monthly Financial Overview Bar Chart (Section B)
 * 3. Category-wise Spending Pillars (Section C)
 * 4. Monthly Spending Trends Trajectory (Section D)
 * ============================================================================
 */

// Camera positions dictionary for the 5 focus presets
const CAMERA_PRESETS = {
  overview: { pos: new THREE.Vector3(0, 3.5, 14.5), target: new THREE.Vector3(0, 1.2, 0) },
  summary: { pos: new THREE.Vector3(0, 5.2, 8.5), target: new THREE.Vector3(0, 5.0, 0) },
  monthly: { pos: new THREE.Vector3(-4.5, 1.5, 8.0), target: new THREE.Vector3(-3.8, 1.0, 0) },
  categories: { pos: new THREE.Vector3(4.5, 1.5, 8.0), target: new THREE.Vector3(3.8, 1.0, 0) },
  trends: { pos: new THREE.Vector3(0, -0.5, 8.5), target: new THREE.Vector3(0, -1.2, 1.5) }
};

function CameraController({ activeMode, resetTrigger }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const targetCameraPos = useRef(CAMERA_PRESETS.overview.pos.clone());
  const targetLookAt = useRef(CAMERA_PRESETS.overview.target.clone());

  // Update target when activeMode or resetTrigger changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[activeMode] || CAMERA_PRESETS.overview;
    targetCameraPos.current.copy(preset.pos);
    targetLookAt.current.copy(preset.target);
  }, [activeMode, resetTrigger]);

  // Smooth camera interpolation towards target preset
  useFrame(() => {
    camera.position.lerp(targetCameraPos.current, 0.05);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={6}
      maxDistance={35}
      maxPolarAngle={Math.PI / 2 + 0.08} // Don't go below ground
      rotateSpeed={0.8}
      zoomSpeed={1.0}
    />
  );
}

export default function Scene3D({
  dashboardData,
  monthlyReportData,
  categoryReportData,
  activeMode,
  resetTrigger,
  onInspect
}) {
  return (
    <>
      {/* Dynamic Camera & Controls */}
      <CameraController activeMode={activeMode} resetTrigger={resetTrigger} />

      {/* 1. Atmospheric Lighting */}
      {/* Base ambient illumination */}
      <ambientLight color="#1e293b" intensity={0.8} />

      {/* Main key directional light with soft shadows */}
      <directionalLight
        position={[8, 14, 10]}
        intensity={1.2}
        color="#f8fafc"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Left blue/cyan accent point light */}
      <pointLight position={[-12, 6, 4]} color="#38bdf8" intensity={2.5} distance={30} />

      {/* Right purple/magenta accent point light */}
      <pointLight position={[12, 6, 4]} color="#a855f7" intensity={2.5} distance={30} />

      {/* Center underglow light */}
      <pointLight position={[0, -4, 6]} color="#0284c7" intensity={1.8} distance={25} />

      {/* 2. Cybernetic Floating Environment & Particles */}
      {/* Subtle floating star sparkles */}
      <Sparkles
        count={120}
        scale={[28, 20, 20]}
        size={2.2}
        speed={0.3}
        color="#38bdf8"
        opacity={0.5}
      />

      {/* Secondary purple sparkles */}
      <Sparkles
        count={80}
        scale={[28, 20, 20]}
        size={1.8}
        speed={0.4}
        color="#c084fc"
        opacity={0.4}
      />

      {/* Cybernetic Infinite Grid Floor */}
      <group position={[0, -3.8, 0]}>
        <gridHelper
          args={[40, 40, '#38bdf8', '#1e293b']}
          position={[0, 0, 0]}
        />
        {/* Soft dark reflective ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color="#030712"
            roughness={0.6}
            metalness={0.9}
            transparent
            opacity={0.95}
          />
        </mesh>
      </group>

      {/* 3. Section A: Floating Financial Summary Cards (Top) */}
      <FinancialSummary3D
        dashboardData={dashboardData}
        onInspect={onInspect}
      />

      {/* 4. Section B: 3D Monthly Financial Overview (Left) */}
      <MonthlyOverview3D
        monthlyReportData={monthlyReportData}
        onInspect={onInspect}
      />

      {/* 5. Section C: 3D Category-wise Spending (Right) */}
      <CategorySpending3D
        categoryReportData={categoryReportData}
        onInspect={onInspect}
      />

      {/* 6. Section D: 3D Monthly Spending Trends (Lower Center) */}
      <SpendingTrends3D
        monthlyReportData={monthlyReportData}
        onInspect={onInspect}
      />
    </>
  );
}
