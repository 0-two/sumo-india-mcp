'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';

export interface DemandConfigProps {
  success?: boolean;
  message?: string;
  step?: string;
  files_generated?: {
    routes_xml?: string;
    sumo_config?: string;
  };
  urban_fleet_mix?: {
    passenger_cars_pct?: string;
    yellow_taxis_pct?: string;
    delivery_trucks_pct?: string;
    city_buses_pct?: string;
  };
  gui_aesthetics_linked?: string;
}

/**
 * Neo-Brutalism DemandConfigSummary Component
 * 
 * Renders heterogeneous traffic demand breakdown and simulation configuration settings.
 */
export const DemandConfigSummary: React.FC<DemandConfigProps> = ({ success, message, step, urban_fleet_mix, gui_aesthetics_linked }) => {
  const { sendFollowUpMessage } = useWidgetSDK();

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
            URBAN TRAFFIC SCENARIO
          </h2>
        </div>

        <div style={{
          background: '#FFE600',
          color: '#000000',
          padding: '8px 14px',
          border: '3px solid #000000',
          boxShadow: '3px 3px 0px #000000',
          fontSize: '13px',
          fontWeight: 900,
          textTransform: 'uppercase',
        }}>
          {step || 'STEP 3 CONFIG'}
        </div>
      </div>

      {/* Vehicle Fleet Breakdown Grid */}
      {urban_fleet_mix && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ background: '#FFE600', color: '#000000', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>CARS</span>
            <div style={{ fontSize: '20px', fontWeight: 900, margin: '4px 0' }}>{urban_fleet_mix.passenger_cars_pct}</div>
          </div>

          <div style={{ background: '#00F0FF', color: '#000000', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>TAXIS</span>
            <div style={{ fontSize: '20px', fontWeight: 900, margin: '4px 0' }}>{urban_fleet_mix.yellow_taxis_pct}</div>
          </div>

          <div style={{ background: '#00E676', color: '#000000', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>TRUCKS</span>
            <div style={{ fontSize: '20px', fontWeight: 900, margin: '4px 0' }}>{urban_fleet_mix.delivery_trucks_pct}</div>
          </div>

          <div style={{ background: '#FF007A', color: '#FFFFFF', padding: '14px', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>BUSES</span>
            <div style={{ fontSize: '20px', fontWeight: 900, margin: '4px 0' }}>{urban_fleet_mix.city_buses_pct}</div>
          </div>
        </div>
      )}

      {/* GUI Aesthetics Settings Box */}
      <div style={{
        background: '#1E1E1E',
        border: '3px solid #000000',
        boxShadow: '4px 4px 0px #000000',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 900, color: '#FFE600', textTransform: 'uppercase' }}>
          GUI THEME LINKAGE
        </h4>
        <div style={{ fontSize: '13px', fontWeight: 800 }}>
          Aesthetics: <span style={{ color: '#00F0FF' }}>{gui_aesthetics_linked || 'gui-settings.view.xml'}</span> | Status: <span style={{ color: '#00E676' }}>READY FOR VISUAL LAUNCH</span>
        </div>
      </div>

      {/* Next Step Agent Trigger Button */}
      <button
        onClick={() => sendFollowUpMessage && sendFollowUpMessage('Now execute run_sumo_simulation tool to run simulation analytics.')}
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
        🚀 RUN SUMO SIMULATION NOW
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
