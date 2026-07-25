'use client';

import React from 'react';
import { useWidgetSDK, useWidgetState } from '@nitrostack/widgets';

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
 * Neo-Brutalism SimulationSummary Component
 * 
 * High-contrast, tactile, retro-futuristic dashboard card displaying Indian 
 * Heterogeneous Traffic simulation metrics with sublane lateral gap awareness.
 */
export const SimulationSummary: React.FC<SimulationSummaryProps> = ({ success, message, metrics }) => {
  const { 
    isReady, 
    sendFollowUpMessage, 
    requestFullscreen, 
    requestPip, 
    requestInline, 
    displayMode,
    callTool
  } = useWidgetSDK();

  const [activeTab, setActiveTab] = useWidgetState<'overview' | 'fleet' | 'diagnostics' | 'actions'>(
    'simulation_tab_state',
    'overview'
  );

  const [isReRunning, setIsReRunning] = React.useState(false);

  if (!metrics) {
    return (
      <div style={{
        padding: '32px',
        background: '#FFE600',
        color: '#000000',
        borderRadius: '0px',
        border: '4px solid #000000',
        boxShadow: '6px 6px 0px #000000',
        textAlign: 'center',
        fontFamily: "'Courier New', Courier, monospace, sans-serif",
        fontWeight: 800,
      }}>
        <h3 style={{ textTransform: 'uppercase', margin: '0 0 8px 0', fontSize: '18px' }}>⚡ NO SIMULATION DATA ⚡</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>Awaiting traffic simulation outcome metrics from SUMO engine...</p>
      </div>
    );
  }

  const { meanWaitingTime, meanTravelTime, running } = metrics;

  // Determine Neo-Brutalist Congestion Badge
  let badgeBg = '#00E676'; // High voltage green
  let badgeText = 'LOW CONGESTION (OPTIMAL)';

  if (meanWaitingTime >= 30) {
    badgeBg = '#FF007A'; // Hot Pink / Red
    badgeText = 'SEVERE CONGESTION (ALERT)';
  } else if (meanWaitingTime >= 10) {
    badgeBg = '#FF6B00'; // Electric Orange
    badgeText = 'MODERATE CONGESTION (WARN)';
  }

  const handleOptimizePrompt = (promptText: string) => {
    if (sendFollowUpMessage) {
      sendFollowUpMessage(promptText);
    }
  };

  const handleReRunSim = async () => {
    if (!callTool) return;
    setIsReRunning(true);
    try {
      await callTool('run_simulation', { timeout_seconds: 120 });
    } catch (err) {
      console.error('Failed to re-run simulation from widget:', err);
    } finally {
      setIsReRunning(false);
    }
  };

  return (
    <div style={{
      background: '#121212',
      color: '#FFFFFF',
      padding: '24px',
      borderRadius: '0px',
      border: '4px solid #000000',
      boxShadow: '8px 8px 0px #000000',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: '680px',
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {/* Neo-Brutalist Header Banner */}
      <div style={{
        background: '#FFE600',
        color: '#000000',
        padding: '16px 20px',
        border: '3px solid #000000',
        boxShadow: '4px 4px 0px #000000',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 900, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase',
            background: '#000000',
            color: '#FFE600',
            padding: '2px 8px',
            borderRadius: '0px',
            display: 'inline-block',
            marginBottom: '6px'
          }}>
            SUMO INDIA MCP
          </span>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
            INDIAN TRAFFIC DASHBOARD
          </h2>
        </div>

        <div style={{
          backgroundColor: badgeBg,
          color: '#000000',
          padding: '8px 14px',
          border: '3px solid #000000',
          boxShadow: '3px 3px 0px #000000',
          fontSize: '12px',
          fontWeight: 900,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {badgeText}
        </div>
      </div>

      {/* Interactive Neo-Brutalism Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'overview', label: '📊 OVERVIEW' },
          { id: 'fleet', label: '🚗 FLEET & SUBLANE' },
          { id: 'diagnostics', label: '⚡ DIAGNOSTICS' },
          { id: 'actions', label: '🛠️ ACTIONS' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 14px',
                background: isActive ? '#00F0FF' : '#222222',
                color: isActive ? '#000000' : '#FFFFFF',
                border: '3px solid #000000',
                boxShadow: isActive ? '3px 3px 0px #000000' : '2px 2px 0px #000000',
                fontWeight: 900,
                fontSize: '11px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transform: isActive ? 'translate(-1px, -1px)' : 'none',
                transition: 'all 0.1s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '14px',
            marginBottom: '20px'
          }}>
            {/* Average Delay Card */}
            <div style={{
              background: '#00F0FF',
              color: '#000000',
              padding: '18px 14px',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px #000000',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                AVERAGE DELAY
              </span>
              <div style={{ fontSize: '36px', fontWeight: 900, lineHeight: '1' }}>
                {meanWaitingTime}
                <span style={{ fontSize: '16px', fontWeight: 900, marginLeft: '3px' }}>s</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '8px', display: 'block', textTransform: 'uppercase', opacity: 0.85 }}>
                meanWaitingTime
              </span>
            </div>

            {/* Travel Time Card */}
            <div style={{
              background: '#FFE600',
              color: '#000000',
              padding: '18px 14px',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px #000000',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                TRAVEL TIME
              </span>
              <div style={{ fontSize: '36px', fontWeight: 900, lineHeight: '1' }}>
                {meanTravelTime}
                <span style={{ fontSize: '16px', fontWeight: 900, marginLeft: '3px' }}>s</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '8px', display: 'block', textTransform: 'uppercase', opacity: 0.85 }}>
                meanTravelTime
              </span>
            </div>

            {/* Vehicle Volume Card */}
            <div style={{
              background: '#FF007A',
              color: '#FFFFFF',
              padding: '18px 14px',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px #000000',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                ACTIVE VEHICLES
              </span>
              <div style={{ fontSize: '36px', fontWeight: 900, lineHeight: '1' }}>
                {running}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, marginTop: '8px', display: 'block', textTransform: 'uppercase', opacity: 0.9 }}>
                currently running
              </span>
            </div>
          </div>

          {/* Congestion Gauge Meter Bar */}
          <div style={{
            background: '#1E1E1E',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>
              <span>CONGESTION INDEX METER</span>
              <span>{Math.min(100, Math.round((meanWaitingTime / 40) * 100))}% DELAY CAPACITY</span>
            </div>
            <div style={{
              height: '24px',
              background: '#000000',
              border: '2px solid #000000',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(5, (meanWaitingTime / 40) * 100))}%`,
                background: badgeBg,
                transition: 'width 0.5s ease-in-out',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET & SUBLANE */}
      {activeTab === 'fleet' && (
        <div style={{
          background: '#1E1E1E',
          border: '3px solid #000000',
          boxShadow: '4px 4px 0px #000000',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', color: '#FFE600' }}>
            INDIAN HETEROGENEOUS VEHICLE PROFILES
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {[
              { name: 'Two-Wheeler', icon: '🛵', gapLat: '0.4m', maxSpeed: '60 km/h', color: '#00F0FF' },
              { name: 'Auto-Rickshaw', icon: '🛺', gapLat: '0.6m', maxSpeed: '45 km/h', color: '#FFE600' },
              { name: 'Passenger Car', icon: '🚗', gapLat: '0.8m', maxSpeed: '80 km/h', color: '#00E676' },
              { name: 'Bus / Heavy', icon: '🚌', gapLat: '1.0m', maxSpeed: '50 km/h', color: '#FF007A' },
            ].map((v) => (
              <div key={v.name} style={{
                background: v.color,
                color: '#000000',
                padding: '12px',
                border: '3px solid #000000',
                boxShadow: '3px 3px 0px #000000',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{v.icon}</div>
                <div style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}>{v.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '4px' }}>MinGapLat: {v.gapLat}</div>
                <div style={{ fontSize: '10px', fontWeight: 700 }}>Max: {v.maxSpeed}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', fontSize: '12px', background: '#000000', color: '#00F0FF', padding: '12px', border: '2px solid #00F0FF', fontWeight: 800 }}>
            ⚡ <strong>SUBLANE MODEL ACTIVE</strong>: Vehicles accept lateral gap filtering without strict lane discipline, mimicking non-lane traffic dynamics in Indian urban corridors.
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div style={{
          background: '#1E1E1E',
          border: '3px solid #000000',
          boxShadow: '4px 4px 0px #000000',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', color: '#00F0FF' }}>
            SIMULATION STEP DIAGNOSTICS
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
            <div style={{ background: '#2B2B2B', padding: '12px', border: '2px solid #000' }}>
              <span style={{ color: '#AAAAAA', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>ARRIVED VEHICLES</span>
              <strong style={{ fontSize: '20px', color: '#00E676', fontWeight: 900 }}>
                {metrics.additional_stats?.total_arrived_vehicles ?? 0}
              </strong>
            </div>

            <div style={{ background: '#2B2B2B', padding: '12px', border: '2px solid #000' }}>
              <span style={{ color: '#AAAAAA', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>LOADED VEHICLES</span>
              <strong style={{ fontSize: '20px', color: '#00F0FF', fontWeight: 900 }}>
                {metrics.additional_stats?.total_loaded_vehicles ?? 0}
              </strong>
            </div>

            <div style={{ background: '#2B2B2B', padding: '12px', border: '2px solid #000' }}>
              <span style={{ color: '#AAAAAA', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>COLLISIONS REPORTED</span>
              <strong style={{ fontSize: '20px', color: metrics.additional_stats?.collisions_reported ? '#FF007A' : '#00E676', fontWeight: 900 }}>
                {metrics.additional_stats?.collisions_reported ?? 0}
              </strong>
            </div>

            <div style={{ background: '#2B2B2B', padding: '12px', border: '2px solid #000' }}>
              <span style={{ color: '#AAAAAA', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>SIMULATION TIMEFRAME</span>
              <strong style={{ fontSize: '20px', color: '#FFE600', fontWeight: 900 }}>
                {metrics.additional_stats?.simulation_end_time_s ?? 0}s
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIONS */}
      {activeTab === 'actions' && (
        <div style={{
          background: '#1E1E1E',
          border: '3px solid #000000',
          boxShadow: '4px 4px 0px #000000',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', color: '#FF007A' }}>
            AGENT INTERACTION & CONTROLS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => handleOptimizePrompt('Analyze the current mean waiting delay and recommend traffic signal timing adjustments to relieve congestion.')}
              style={{
                padding: '12px 16px',
                background: '#FFE600',
                color: '#000000',
                border: '3px solid #000000',
                boxShadow: '3px 3px 0px #000000',
                fontWeight: 900,
                fontSize: '12px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🤖 ASK AGENT TO OPTIMIZE TRAFFIC FLOW
            </button>

            <button
              onClick={() => handleOptimizePrompt('Generate a new traffic demand scenario with 50% more auto-rickshaws and evaluate congestion changes.')}
              style={{
                padding: '12px 16px',
                background: '#00F0FF',
                color: '#000000',
                border: '3px solid #000000',
                boxShadow: '3px 3px 0px #000000',
                fontWeight: 900,
                fontSize: '12px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🛺 TEST INCREASED AUTO-RICKSHAW DENSITY
            </button>

            <button
              onClick={handleReRunSim}
              disabled={isReRunning}
              style={{
                padding: '12px 16px',
                background: isReRunning ? '#888888' : '#00E676',
                color: '#000000',
                border: '3px solid #000000',
                boxShadow: '3px 3px 0px #000000',
                fontWeight: 900,
                fontSize: '12px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: isReRunning ? 'not-allowed' : 'pointer',
                textAlign: 'left',
              }}
            >
              {isReRunning ? '⏳ EXECUTING SUMO ENGINE...' : '🔄 RE-RUN SIMULATION NOW'}
            </button>
          </div>

          {/* Display Mode Control Triggers */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px dashed #444444', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#AAAAAA', display: 'block', width: '100%' }}>
              WIDGET DISPLAY MODE: ({displayMode || 'inline'})
            </span>

            {requestFullscreen && (
              <button
                onClick={requestFullscreen}
                style={{
                  padding: '6px 10px',
                  background: '#333333',
                  color: '#FFFFFF',
                  border: '2px solid #000',
                  fontWeight: 800,
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                ⤢ FULLSCREEN
              </button>
            )}

            {requestPip && (
              <button
                onClick={requestPip}
                style={{
                  padding: '6px 10px',
                  background: '#333333',
                  color: '#FFFFFF',
                  border: '2px solid #000',
                  fontWeight: 800,
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                🗔 PIP
              </button>
            )}

            {requestInline && (
              <button
                onClick={requestInline}
                style={{
                  padding: '6px 10px',
                  background: '#333333',
                  color: '#FFFFFF',
                  border: '2px solid #000',
                  fontWeight: 800,
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                🗗 INLINE
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Message Footer Box */}
      {message && (
        <div style={{
          background: '#00F0FF',
          color: '#000000',
          padding: '12px 16px',
          border: '3px solid #000000',
          boxShadow: '3px 3px 0px #000000',
          fontSize: '12px',
          fontWeight: 800,
          lineHeight: '1.4'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};
