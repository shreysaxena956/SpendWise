import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ============================================================================
 * SpendWise – 3D Spending Trends Trajectory
 * ============================================================================
 * Section D: 3D Visualization showing monthly spending changes.
 *
 * Renders glowing interconnected nodes and a floating neon trajectory path
 * representing month-over-month expenditure changes, trend directions,
 * and savings velocity with interactive hover insights.
 * ============================================================================
 */

function TrendNode({
  position,
  data,
  prevData,
  onInspect
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Compute month-over-month delta
  const delta = prevData && prevData.expenses > 0
    ? (((data.expenses - prevData.expenses) / prevData.expenses) * 100).toFixed(1)
    : null;

  const isUp = delta !== null && parseFloat(delta) > 0;
  const isDown = delta !== null && parseFloat(delta) < 0;

  // Pulse animation on hover
  useFrame((state) => {
    if (!meshRef.current) return;
    if (hovered) {
      const s = 1.25 + Math.sin(state.clock.getElapsedTime() * 8) * 0.15;
      meshRef.current.scale.set(s, s, s);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onInspect) {
      onInspect({
        type: 'trend',
        title: `${data.fullMonthName || data.monthName} Spending Trend`,
        amount: data.expenses,
        icon: isUp ? '📈' : isDown ? '📉' : '📊',
        description:
          delta !== null
            ? `Expenses changed by ${delta > 0 ? '+' : ''}${delta}% compared to previous month.`
            : 'Initial baseline month for spending trend tracking.'
      });
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 0
    });
  };

  return (
    <group position={position}>
      {/* 3D Glowing Sphere Node */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handlePointerOver}
        castShadow
      >
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : isUp ? '#f87171' : '#38bdf8'}
          emissive={isUp ? '#ef4444' : '#0284c7'}
          emissiveIntensity={hovered ? 1.0 : 0.6}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Outer Halo Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.28, 24]} />
        <meshBasicMaterial
          color={isUp ? '#f87171' : '#38bdf8'}
          transparent
          opacity={hovered ? 0.8 : 0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Month Label Pill */}
      <Html
        transform
        distanceFactor={13}
        position={[0, -0.4, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: hovered ? 800 : 600,
            color: hovered ? '#ffffff' : '#94a3b8',
            textAlign: 'center',
            userSelect: 'none'
          }}
        >
          {data.monthName}
        </div>
      </Html>

      {/* Delta Pill (above node) */}
      {delta !== null && (
        <Html
          transform
          distanceFactor={13}
          position={[0, 0.38, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: isUp ? '#fca5a5' : '#86efac',
              background: isUp
                ? 'rgba(239, 68, 68, 0.25)'
                : 'rgba(34, 197, 94, 0.25)',
              border: `1px solid ${isUp ? '#ef4444' : '#22c55e'}`,
              borderRadius: '6px',
              padding: '1px 5px',
              whiteSpace: 'nowrap'
            }}
          >
            {isUp ? '▲ +' : '▼ '}
            {delta}%
          </div>
        </Html>
      )}

      {/* Hover Info Tooltip */}
      {hovered && (
        <Html
          transform
          distanceFactor={12}
          position={[0, 0.85, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #38bdf8',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8' }}>
              {data.fullMonthName || data.monthName} Spend
            </div>
            <div style={{ color: '#f87171', fontWeight: 600 }}>
              {formatCurrency(data.expenses)}
            </div>
            {delta !== null && (
              <div
                style={{
                  color: isUp ? '#f87171' : '#4ade80',
                  fontSize: '10px',
                  marginTop: '2px'
                }}
              >
                {isUp ? 'Increased' : 'Decreased'} by {Math.abs(delta)}%
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SpendingTrends3D({ monthlyReportData, onInspect }) {
  const overviewList = monthlyReportData?.monthlyOverview || [];

  // Show 6 most recent months
  const displayMonths = overviewList.length > 6
    ? overviewList.slice(overviewList.length - 6)
    : overviewList;

  const maxExpense = Math.max(...displayMonths.map((m) => m.expenses || 0), 100);
  const minExpense = Math.min(...displayMonths.map((m) => m.expenses || 0));

  // Compute 3D node coordinates
  const nodePoints = useMemo(() => {
    const points = [];
    const count = displayMonths.length;
    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * 1.5;
      // Normalize Y height between -0.4 and 1.2
      const exp = displayMonths[i].expenses || 0;
      const normalizedY =
        maxExpense === minExpense
          ? 0.4
          : ((exp - minExpense) / (maxExpense - minExpense || 1)) * 1.4;
      const z = 0;
      points.push(new THREE.Vector3(x, normalizedY, z));
    }
    return points;
  }, [displayMonths, maxExpense, minExpense]);

  // Construct continuous line curve
  const curvePoints = useMemo(() => {
    if (nodePoints.length < 2) return [];
    const curve = new THREE.CatmullRomCurve3(nodePoints);
    return curve.getPoints(50);
  }, [nodePoints]);

  return (
    <group position={[0, -2.2, 2.0]}>
      {/* Background Glow Platform */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.15, 1.8]} />
        <meshStandardMaterial
          color="#0b1329"
          roughness={0.4}
          metalness={0.8}
          emissive="#1e293b"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cyber Grid Border */}
      <lineSegments position={[0, -0.52, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(8.22, 0.02, 1.82)]} />
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.3} />
      </lineSegments>

      {/* Header Label Floating Above */}
      <Html
        transform
        distanceFactor={13}
        position={[0, 2.0, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            padding: '5px 14px',
            color: '#f8fafc',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: '#38bdf8' }}>📈 3D Monthly Spending Trends</span>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
            Month-over-Month Expenditure Trajectory
          </div>
        </div>
      </Html>

      {/* Connecting Tube / Path between nodes */}
      {curvePoints.length > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={curvePoints.length}
              array={new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#38bdf8" linewidth={3} />
        </line>
      )}

      {/* Trend Nodes */}
      {displayMonths.map((item, idx) => {
        const pos = nodePoints[idx]
          ? [nodePoints[idx].x, nodePoints[idx].y, nodePoints[idx].z]
          : [0, 0, 0];
        const prev = idx > 0 ? displayMonths[idx - 1] : null;

        return (
          <TrendNode
            key={item.month || idx}
            position={pos}
            data={item}
            prevData={prev}
            onInspect={onInspect}
          />
        );
      })}
    </group>
  );
}
