'use client';

import React from 'react';

export interface SimulationMetrics {
  meanWaitingTime: number;
  meanTravelTime: number;
  running: number;
  additional_stats?: {
    simulation_end_time_s?: number;
    total_loaded_vehicles?: number;
    total_arrived_vehicles?: number;
    collisions_reported?: number;
  };
}

export interface SimulationSummaryProps {
  success?: boolean;
  message?: string;
  metrics?: SimulationMetrics;
}

/**
 * SimulationSummary React Component
 * 
 * Renders an enterprise dashboard card for Western Homogeneous Traffic simulation outcomes.
 * Features real-time urban congestion grading badges and cleanly formatted physical travel statistics.
 */
export const SimulationSummary: React.FC<SimulationSummaryProps> = ({ success, message, metrics }) => {
  if (!metrics) {
    return (
      <div style={{
        padding: '24px',
        background: '#18181b',
        color: '#e4e4e7',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Awaiting urban traffic simulation analytics...</p>
      </div>
    );
  }

  const { meanWaitingTime, meanTravelTime, running } = metrics;

  let badgeColor = '#22c55e'; // Green
  let badgeBg = 'rgba(34, 197, 94, 0.15)';
  let badgeText = 'SMOOTH FLOW (LOW CONGESTION)';

  if (meanWaitingTime >= 30) {
    badgeColor = '#ef4444'; // Red
    badgeBg = 'rgba(239, 68, 68, 0.18)';
    badgeText = 'HEAVY GRIDLOCK (RED CONGESTION)';
  } else if (meanWaitingTime >= 12) {
    badgeColor = '#eab308'; // Yellow
    badgeBg = 'rgba(234, 179, 8, 0.18)';
    badgeText = 'MODERATE URBAN DELAYS (YELLOW)';
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e1e26, #111116)',
      color: '#f8fafc',
      padding: '24px',
      borderRadius: '18px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '640px',
      margin: '0 auto',
      transition: 'all 0.3s ease-in-out',
    }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '22px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Urban Mobility Simulation Results
          </h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Western lane-disciplined urban traffic corridor analysis
          </p>
        </div>
        <div style={{
          backgroundColor: badgeBg,
          color: badgeColor,
          padding: '7px 14px',
          borderRadius: '24px',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.04em',
          border: `1px solid ${badgeColor}`,
          whiteSpace: 'nowrap',
          boxShadow: `0 0 14px ${badgeBg}`,
          textTransform: 'uppercase'
        }}>
          {badgeText}
        </div>
      </div>

      {/* Key Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.035)',
          padding: '18px 14px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Average Stop Delay
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: badgeColor, lineHeight: '1' }}>
            {meanWaitingTime}
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', marginLeft: '3px' }}>s</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
            per active vehicle
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.035)',
          padding: '18px 14px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Mean Trip Duration
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', lineHeight: '1' }}>
            {meanTravelTime}
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', marginLeft: '3px' }}>s</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
            meanTravelTime
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.035)',
          padding: '18px 14px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Active Fleet Volume
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#a78bfa', lineHeight: '1' }}>
            {running}
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
            vehicles in network
          </span>
        </div>
      </div>

      {/* Additional Supporting Diagnostics */}
      {metrics.additional_stats && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: '14px',
          borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          color: '#cbd5e1',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>Arrived Trips: <strong style={{ color: '#10b981', marginLeft: '4px' }}>{metrics.additional_stats.total_arrived_vehicles ?? 0}</strong></div>
          <div>Loaded Fleet: <strong style={{ color: '#60a5fa', marginLeft: '4px' }}>{metrics.additional_stats.total_loaded_vehicles ?? 0}</strong></div>
          <div>Collisions: <strong style={{ color: metrics.additional_stats.collisions_reported ? '#f43f5e' : '#10b981', marginLeft: '4px' }}>{metrics.additional_stats.collisions_reported ?? 0}</strong></div>
          <div>Sim Horizon: <strong style={{ color: '#e2e8f0', marginLeft: '4px' }}>{metrics.additional_stats.simulation_end_time_s ?? 0}s</strong></div>
        </div>
      )}

      {/* Summary Message Status */}
      {message && (
        <div style={{
          marginTop: '18px',
          padding: '12px 16px',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          borderRadius: '10px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          fontSize: '12px',
          color: '#7dd3fc',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};
