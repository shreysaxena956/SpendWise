import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ============================================================================
 * SpendWise – 3D Category-wise Spending Visualization
 * ============================================================================
 * Section C: Interactive 3D visualization showing spending across categories:
 * Food, Rent, Travel, Shopping, Bills, Entertainment, Healthcare, etc.
 *
 * Renders glowing 3D pillars arranged in an arc with heights proportional to
 * spending, category icons, percentage labels, and interactive tooltips.
 * ============================================================================
 */

// Category emoji & color palette dictionary
const CATEGORY_STYLES = {
  'food & dining': { color: '#f59e0b', glow: '#fbbf24', icon: '🍔' },
  'food': { color: '#f59e0b', glow: '#fbbf24', icon: '🍔' },
  'rent & housing': { color: '#8b5cf6', glow: '#a78bfa', icon: '🏠' },
  'rent': { color: '#8b5cf6', glow: '#a78bfa', icon: '🏠' },
  'groceries': { color: '#10b981', glow: '#34d399', icon: '🥦' },
  'utilities': { color: '#06b6d4', glow: '#22d3ee', icon: '⚡' },
  'bills': { color: '#06b6d4', glow: '#22d3ee', icon: '📄' },
  'transportation': { color: '#3b82f6', glow: '#60a5fa', icon: '🚇' },
  'travel': { color: '#3b82f6', glow: '#60a5fa', icon: '✈️' },
  'entertainment': { color: '#ec4899', glow: '#f472b6', icon: '🎬' },
  'health & fitness': { color: '#ef4444', glow: '#f87171', icon: '💊' },
  'healthcare': { color: '#ef4444', glow: '#f87171', icon: '🏥' },
  'shopping': { color: '#a855f7', glow: '#c084fc', icon: '🛍️' },
  'education': { color: '#14b8a6', glow: '#2dd4bf', icon: '📚' },
  'miscellaneous': { color: '#64748b', glow: '#94a3b8', icon: '📦' },
  'other': { color: '#64748b', glow: '#94a3b8', icon: '📦' },
  'uncategorised': { color: '#94a3b8', glow: '#cbd5e1', icon: '📁' }
};

function getCategoryStyle(name = '') {
  const key = name.trim().toLowerCase();
  return CATEGORY_STYLES[key] || {
    color: '#3b82f6',
    glow: '#60a5fa',
    icon: '🏷️'
  };
}

function CategoryPillar({
  position,
  height,
  category,
  onInspect
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const currentHeight = useRef(0.1);

  const style = getCategoryStyle(category.category);
  const targetH = Math.max(0.3, height);

  useFrame(() => {
    if (!meshRef.current) return;
    currentHeight.current = THREE.MathUtils.lerp(currentHeight.current, targetH, 0.1);
    meshRef.current.scale.y = currentHeight.current;
    meshRef.current.position.y = currentHeight.current / 2;
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onInspect) {
      onInspect({
        type: 'expense',
        title: category.category,
        amount: category.totalAmount,
        icon: style.icon,
        description: `Contributes ${category.percentage}% of overall expenses (${category.transactionCount || 1} transactions).`
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
      {/* 3D Cylindrical Pillar */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handlePointerOver}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.3, 0.35, 1, 16]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : style.color}
          roughness={0.25}
          metalness={0.5}
          emissive={style.color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>

      {/* Glowing Cap Wire on top of the pillar */}
      <mesh position={[0, targetH + 0.05, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.06, 16]} />
        <meshBasicMaterial color={style.glow} />
      </mesh>

      {/* Floating Category Icon and Percentage Pill */}
      <Html
        transform
        distanceFactor={13}
        position={[0, targetH + 0.45, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${style.glow}`,
            borderRadius: '12px',
            padding: '3px 7px',
            color: '#f8fafc',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 700,
            boxShadow: `0 0 12px ${style.color}55`,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>{style.icon}</span>
          <span>{category.percentage}%</span>
        </div>
      </Html>

      {/* Base Name Label */}
      <Html
        transform
        distanceFactor={14}
        position={[0, 0.08, 0.65]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: hovered ? 800 : 600,
            color: hovered ? '#ffffff' : '#cbd5e1',
            background: hovered ? `${style.color}44` : 'transparent',
            padding: '2px 4px',
            borderRadius: '4px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            maxWidth: '70px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {category.category}
        </div>
      </Html>

      {/* Hover Info Tooltip */}
      {hovered && (
        <Html
          transform
          distanceFactor={12}
          position={[0, targetH + 0.95, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${style.glow}`,
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '11px',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontWeight: 700, color: style.glow }}>
              {category.category}
            </div>
            <div style={{ color: '#f87171', fontWeight: 600 }}>
              Spent: {formatCurrency(category.totalAmount)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '10px' }}>
              {category.percentage}% of expenses • {category.transactionCount || 1} items
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function CategorySpending3D({ categoryReportData, onInspect }) {
  const categoriesList = categoryReportData?.categories || [];

  // Show top categories (up to 7 for visual elegance)
  const displayCategories = categoriesList.slice(0, 7);

  // Normalize heights
  const maxVal = Math.max(...displayCategories.map((c) => c.totalAmount || 0), 100);
  const maxHeightUnits = 3.0;

  return (
    <group position={[5.8, -0.6, 0]} rotation={[0, -0.28, 0]}>
      {/* Pedestal Base Slab */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.2, 2.4]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.3}
          metalness={0.8}
          emissive="#1e293b"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cybernetic Wire on Pedestal */}
      <lineSegments position={[0, 0.01, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(5.62, 0.02, 2.42)]} />
        <lineBasicMaterial color="#a855f7" transparent opacity={0.35} />
      </lineSegments>

      {/* Header Label Floating Above Pedestal */}
      <Html
        transform
        distanceFactor={13}
        position={[0, 4.0, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
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
          <span style={{ color: '#c084fc' }}>🏷️ 3D Category Spending</span>
          <div
            style={{
              fontSize: '10px',
              color: '#94a3b8',
              marginTop: '2px',
              fontWeight: 500
            }}
          >
            {categoriesList.length} Active Expense Categories
          </div>
        </div>
      </Html>

      {/* Category Pillars arranged in an arc/row */}
      {displayCategories.length > 0 ? (
        displayCategories.map((cat, idx) => {
          const count = displayCategories.length;
          // Space pillars evenly across X
          const xOffset = (idx - (count - 1) / 2) * 0.76;
          // Slight arc curve along Z
          const zOffset = Math.sin((idx / (count - 1 || 1)) * Math.PI) * 0.25;

          const pillarHeight = (cat.totalAmount / maxVal) * maxHeightUnits;

          return (
            <CategoryPillar
              key={cat.category || idx}
              position={[xOffset, 0, zOffset]}
              height={pillarHeight}
              category={cat}
              onInspect={onInspect}
            />
          );
        })
      ) : (
        <Html transform distanceFactor={12} position={[0, 1.2, 0]}>
          <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
            No expense records recorded yet.
          </div>
        </Html>
      )}
    </group>
  );
}
