import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ============================================================================
 * SpendWise – 3D Monthly Financial Overview (Bar Chart)
 * ============================================================================
 * Section B: Interactive 3D Bar Chart comparing Monthly Income vs Monthly Expenses.
 *
 * Renders dual bars (Emerald Green for Income, Crimson/Coral for Expenses)
 * on an angled cybernetic pedestal with interactive hover tooltips,
 * height animations, and clear readable labels.
 * ============================================================================
 */

function SingleBar({
  position,
  height,
  color,
  glowColor,
  label,
  amount,
  type,
  monthName,
  onInspect
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const currentHeight = useRef(0.1);

  // Smooth height emergence animation
  useFrame(() => {
    if (!meshRef.current) return;
    const targetH = Math.max(0.15, height);
    currentHeight.current = THREE.MathUtils.lerp(currentHeight.current, targetH, 0.1);
    meshRef.current.scale.y = currentHeight.current;
    // Keep base anchored at Y = 0
    meshRef.current.position.y = currentHeight.current / 2;
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onInspect) {
      onInspect({
        type: type.toLowerCase(),
        title: `${monthName} ${type}`,
        amount,
        icon: type === 'Income' ? '📈' : '📉',
        description: `Total ${type.toLowerCase()} recorded for ${monthName}.`
      });
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  return (
    <group position={position}>
      {/* 3D Vertical Bar */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handlePointerOver}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.35, 1, 0.35]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          roughness={0.2}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={hovered ? 0.7 : 0.25}
        />
      </mesh>

      {/* Glowing Cap Wire on top of the bar */}
      <lineSegments position={[0, Math.max(0.15, height), 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.36, 0.05, 0.36)]} />
        <lineBasicMaterial color={glowColor} linewidth={2} />
      </lineSegments>
    </group>
  );
}

export default function MonthlyOverview3D({ monthlyReportData, onInspect }) {
  const overviewList = monthlyReportData?.monthlyOverview || [];
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Take the 6 most recent or non-empty months for clean desktop 3D view
  const displayMonths = overviewList.length > 6
    ? overviewList.slice(overviewList.length - 6)
    : overviewList;

  // Find max value to normalize bar heights (max height = 3.5 units)
  const maxVal = Math.max(
    ...displayMonths.map((m) => Math.max(m.income || 0, m.expenses || 0)),
    1000
  );

  const maxHeightUnits = 3.2;

  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 0
    });
  };

  return (
    <group position={[-5.8, -0.6, 0]} rotation={[0, 0.28, 0]}>
      {/* Pedestal Base Slab */}
      <mesh position={[2.2, -0.1, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.2, 2.2]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.3}
          metalness={0.8}
          emissive="#1e293b"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cybernetic Grid Wire on the Pedestal */}
      <lineSegments position={[2.2, 0.01, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(5.62, 0.02, 2.22)]} />
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </lineSegments>

      {/* Header Label Floating Above Pedestal */}
      <Html
        transform
        distanceFactor={13}
        position={[2.2, 4.0, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            padding: '6px 14px',
            color: '#f8fafc',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: '#38bdf8' }}>📊 3D Monthly Overview</span>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              fontSize: '10px',
              fontWeight: 600,
              marginTop: '4px',
              justifyContent: 'center'
            }}
          >
            <span style={{ color: '#4ade80' }}>■ Income</span>
            <span style={{ color: '#f87171' }}>■ Expense</span>
          </div>
        </div>
      </Html>

      {/* Monthly Bar Pairs */}
      {displayMonths.map((item, idx) => {
        const xOffset = idx * 0.9;
        const incomeHeight = (item.income / maxVal) * maxHeightUnits;
        const expenseHeight = (item.expenses / maxVal) * maxHeightUnits;

        const isHovered = hoveredMonth === item.monthName;

        return (
          <group
            key={item.month || idx}
            position={[xOffset, 0, 0]}
            onPointerOver={() => setHoveredMonth(item.monthName)}
            onPointerOut={() => setHoveredMonth(null)}
          >
            {/* Income Bar (Green, front) */}
            <SingleBar
              position={[0, 0, 0.25]}
              height={incomeHeight}
              color="#22c55e"
              glowColor="#4ade80"
              label="Income"
              amount={item.income}
              type="Income"
              monthName={item.monthName}
              onInspect={onInspect}
            />

            {/* Expense Bar (Coral/Red, back) */}
            <SingleBar
              position={[0, 0, -0.25]}
              height={expenseHeight}
              color="#ef4444"
              glowColor="#f87171"
              label="Expense"
              amount={item.expenses}
              type="Expense"
              monthName={item.monthName}
              onInspect={onInspect}
            />

            {/* Month Label Pill underneath on the pedestal */}
            <Html
              transform
              distanceFactor={14}
              position={[0, 0.08, 0.8]}
              style={{ pointerEvents: 'none' }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: isHovered ? 800 : 600,
                  color: isHovered ? '#38bdf8' : '#94a3b8',
                  background: isHovered
                    ? 'rgba(56, 189, 248, 0.2)'
                    : 'transparent',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  userSelect: 'none'
                }}
              >
                {item.monthName}
              </div>
            </Html>

            {/* Hover Tooltip showing dual amounts */}
            {isHovered && (
              <Html
                transform
                distanceFactor={12}
                position={[0, Math.max(incomeHeight, expenseHeight) + 0.6, 0]}
                style={{ pointerEvents: 'none' }}
              >
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '11px',
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    {item.fullMonthName || item.monthName}
                  </div>
                  <div style={{ color: '#4ade80' }}>
                    +In: {formatCurrency(item.income)}
                  </div>
                  <div style={{ color: '#f87171' }}>
                    -Ex: {formatCurrency(item.expenses)}
                  </div>
                  <div style={{ color: '#38bdf8', fontSize: '10px', marginTop: '2px' }}>
                    Net: {formatCurrency(item.income - item.expenses)}
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
