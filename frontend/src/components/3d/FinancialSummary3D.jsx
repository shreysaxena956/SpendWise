import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * ============================================================================
 * SpendWise – 3D Financial Summary Floating Cards
 * ============================================================================
 * Section A: 3 floating glass-style 3D cards:
 * 1. Total Income (Green neon theme)
 * 2. Current Balance (Cyan neon theme)
 * 3. Total Expenses (Coral/Red neon theme)
 *
 * Uses actual values from backend API with smooth floating animations,
 * interactive hover effects, and crisp readable typography.
 * ============================================================================
 */

function FloatingGlassCard({
  position,
  title,
  amount,
  type, // 'income' | 'expense' | 'balance'
  icon,
  subtitle,
  onInspect,
  floatSpeed = 1,
  floatOffset = 0
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Smooth floating animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * floatSpeed + floatOffset;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.15;
    // Slight tilt on hover
    if (hovered) {
      meshRef.current.scale.lerp({ x: 1.05, y: 1.05, z: 1.05 }, 0.1);
    } else {
      meshRef.current.scale.lerp({ x: 1, y: 1, z: 1 }, 0.1);
    }
  });

  // Color theme mapping
  const colors = {
    income: {
      primary: '#22c55e',
      glow: '#4ade80',
      bgBorder: 'rgba(74, 222, 128, 0.4)',
      bgGrad: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(15, 23, 42, 0.85))'
    },
    expense: {
      primary: '#ef4444',
      glow: '#f87171',
      bgBorder: 'rgba(248, 113, 113, 0.4)',
      bgGrad: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(15, 23, 42, 0.85))'
    },
    balance: {
      primary: '#38bdf8',
      glow: '#60a5fa',
      bgBorder: 'rgba(56, 189, 248, 0.45)',
      bgGrad: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.85))'
    }
  };

  const theme = colors[type] || colors.balance;

  const formatCurrency = (val) => {
    return '₹' + Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onInspect) {
      onInspect({
        type,
        title,
        amount,
        icon,
        description:
          type === 'income'
            ? 'Total verified income recorded across all categories.'
            : type === 'expense'
            ? 'Total expenditures tracked in SpendWise.'
            : 'Net current cash balance available (Income minus Expenses).'
      });
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handlePointerOver}
    >
      {/* 3D Glass Slab Mesh */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.8, 2.2, 0.25]} />
        <meshPhysicalMaterial
          color={hovered ? '#1e293b' : '#0f172a'}
          roughness={0.15}
          metalness={0.7}
          transmission={0.6}
          transparent={true}
          opacity={0.88}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          emissive={theme.primary}
          emissiveIntensity={hovered ? 0.35 : 0.12}
        />
      </mesh>

      {/* Outer Wireframe / Neon Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3.82, 2.22, 0.26)]} />
        <lineBasicMaterial
          color={hovered ? '#ffffff' : theme.glow}
          linewidth={hovered ? 2 : 1}
          transparent
          opacity={hovered ? 0.9 : 0.6}
        />
      </lineSegments>

      {/* Crisp HTML Overlay anchored inside the 3D space */}
      <Html
        transform
        distanceFactor={11}
        position={[0, 0, 0.14]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: '280px',
            padding: '16px 18px',
            borderRadius: '12px',
            background: theme.bgGrad,
            border: `1px solid ${theme.bgBorder}`,
            boxShadow: hovered
              ? `0 0 25px ${theme.primary}55`
              : '0 8px 24px rgba(0,0,0,0.5)',
            transition: 'all 0.2s ease',
            color: '#ffffff',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: theme.glow
              }}
            >
              {title}
            </span>
            <span style={{ fontSize: '18px' }}>{icon}</span>
          </div>

          <div
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}
          >
            {type === 'income' ? '+' : type === 'expense' ? '-' : amount < 0 ? '-' : ''}
            {formatCurrency(amount)}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{subtitle}</span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.08)',
                color: '#cbd5e1'
              }}
            >
              Real-time
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Global THREE import helper inside R3F
import * as THREE from 'three';

export default function FinancialSummary3D({ dashboardData, onInspect }) {
  const totalIncome = dashboardData?.totalIncome || 0;
  const totalExpenses = dashboardData?.totalExpenses || 0;
  const currentBalance = dashboardData?.currentBalance || 0;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Total Income Card (Left) */}
      <FloatingGlassCard
        position={[-4.8, 5.0, 0]}
        title="Total Income"
        amount={totalIncome}
        type="income"
        icon="📈"
        subtitle="Cumulative Earnings"
        onInspect={onInspect}
        floatSpeed={1.2}
        floatOffset={0}
      />

      {/* 2. Current Balance Card (Center, slightly elevated & closer) */}
      <FloatingGlassCard
        position={[0, 5.3, 0.5]}
        title="Current Balance"
        amount={currentBalance}
        type="balance"
        icon="💼"
        subtitle={currentBalance >= 0 ? 'Surplus / Available' : 'Deficit / Attention'}
        onInspect={onInspect}
        floatSpeed={1.0}
        floatOffset={1.5}
      />

      {/* 3. Total Expenses Card (Right) */}
      <FloatingGlassCard
        position={[4.8, 5.0, 0]}
        title="Total Expenses"
        amount={totalExpenses}
        type="expense"
        icon="📉"
        subtitle="Cumulative Outflows"
        onInspect={onInspect}
        floatSpeed={1.1}
        floatOffset={2.8}
      />
    </group>
  );
}
