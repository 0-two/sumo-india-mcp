'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';

export interface DemandConfigProps {
  success?: boolean;
  message?: string;
  config_summary?: {
    total_vehicles: number;
    breakdown: {
      two_wheeler: number;
      auto_rickshaw: number;
      passenger_car: number;
      bus: number;
    };
    sublane_model: {
      enabled: boolean;
      lateral_resolution_m: number;
    };
  };
  artifacts?: {
    routes_file?: string;
    sumo_config_file?: string;
  };
}

/**
 * Neo-Brutalism DemandConfigSummary Component
 * 
 * Renders heterogeneous traffic demand breakdown and sublane model parameters.
 */
export const DemandConfigSummary: React.FC<DemandConfigProps> = ({ success, message, config_summary, artifacts }) => {
  const { sendFollowUpMessage } = useWidgetSDK();

  if (!config_summary) {
    return (
      <div style={{
        padding: '24px',
        background: '#FFE600',
        color: '#000000',
        border: '4px solid #000000',
        boxShadow: '6px 6px 0px #000000',
        textAlign: 'center',
        fontWeight: 800,
        fontFamily: "'Courier New', Courier, monospace",
      }}>
        Awaiting SUMO traffic demand configuration parameters...
      </div>
    );
  }

  const { total_vehicles, breakdown, sublane_model } = config_summary;

  return (
    <div style={{
      background: '#121212',
      color: '#FFFFFF',
      padding: '24px',
      border: '4px solid #000000',
      boxShadow: '8px 8px 0px #000000',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: '680px',
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {/* Neo-Brutalist Header */}
      <div style={{
        background: '#00F0FF',
        color: '#000000',
        padding: '16px 20px',
        border: '3px solid #000000',
        boxShadow: '4px 4px 0px #000000',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <span style={{
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: '#000000',
            color: '#00F0FF',
            padding: '2px 8px',
            display: 'inline-block',
            marginBottom: '6px',
          }}>
            TRAFFIC DEMAND GENERATOR
          </span>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            HETEROGENEOUS FLEET DEMAND
          </h2>
        </div>

        <div style={{
          background: '#FFE600',
          color: '#000000',
          padding: '8px 14px',
          border: '3px solid #000000',
          boxShadow: '3px 3px 0px #000000',
          fontSize: '14px',
          fontWeight: 900,
          textTransform: 'uppercase',
        }}>
          {total_vehicles} VEHICLES
        </div>
      </div>

      {/* Vehicle Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ background: '#FFE600', color: '#000000', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>2-WHEELERS</span>
          <div style={{ fontSize: '28px', fontWeight: 900, margin: '4px 0' }}>{breakdown.two_wheeler}</div>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
            {Math.round((breakdown.two_wheeler / total_vehicles) * 100)}% MIX
          </span>
        </div>

        <div style={{ background: '#00F0FF', color: '#000000', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>AUTOS</span>
          <div style={{ fontSize: '28px', fontWeight: 900, margin: '4px 0' }}>{breakdown.auto_rickshaw}</div>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
            {Math.round((breakdown.auto_rickshaw / total_vehicles) * 100)}% MIX
          </span>
        </div>

        <div style={{ background: '#00E676', color: '#000000', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>CARS</span>
          <div style={{ fontSize: '28px', fontWeight: 900, margin: '4px 0' }}>{breakdown.passenger_car}</div>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
            {Math.round((breakdown.passenger_car / total_vehicles) * 100)}% MIX
          </span>
        </div>

        <div style={{ background: '#FF007A', color: '#FFFFFF', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>BUSES</span>
          <div style={{ fontSize: '28px', fontWeight: 900, margin: '4px 0' }}>{breakdown.bus}</div>
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
            {Math.round((breakdown.bus / total_vehicles) * 100)}% MIX
          </span>
        </div>
      </div>

      {/* Sublane Settings Box */}
      <div style={{
        background: '#1E1E1E',
        border: '3px solid #000000',
        boxShadow: '4px 4px 0px #000000',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 900, color: '#FFE600', textTransform: 'uppercase' }}>
          SUBLANE LATERAL MODEL RESOLUTION
        </h4>
        <div style={{ fontSize: '13px', fontWeight: 800 }}>
          Resolution: <span style={{ color: '#00F0FF' }}>{sublane_model.lateral_resolution_m}m</span> | Status: <span style={{ color: '#00E676' }}>ENABLED (NON-LANE DISCIPLINE)</span>
        </div>
      </div>

      {/* Next Step Agent Trigger Button */}
      <button
        onClick={() => sendFollowUpMessage && sendFollowUpMessage('Now run the simulation using run_simulation tool and report outcomes.')}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#00E676',
          color: '#000000',
          border: '3px solid #000000',
          boxShadow: '4px 4px 0px #000000',
          fontWeight: 900,
          fontSize: '13px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        🚀 RUN SIMULATION WITH PROCESSED DEMAND
      </button>

      {message && (
        <div style={{
          marginTop: '16px',
          background: '#222222',
          color: '#00F0FF',
          padding: '12px',
          border: '2px solid #000',
          fontSize: '12px',
          fontWeight: 800,
        }}>
          {message}
        </div>
      )}
    </div>
  );
};
