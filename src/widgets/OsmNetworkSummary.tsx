'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';

export interface OsmNetworkProps {
  success?: boolean;
  message?: string;
  step?: string;
  file_path?: string;
  safe_mode?: boolean;
}

/**
 * Neo-Brutalism OsmNetworkSummary Component
 * 
 * Displays OpenStreetMap network import status and download status.
 */
export const OsmNetworkSummary: React.FC<OsmNetworkProps> = ({ success, message, step, file_path, safe_mode }) => {
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
        background: '#FF007A',
        color: '#FFFFFF',
        padding: '16px 20px',
        border: '3px solid #000000',
        boxShadow: '4px 4px 0px #000000',
        marginBottom: '20px',
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: '#000000',
          color: '#FF007A',
          padding: '2px 8px',
          display: 'inline-block',
          marginBottom: '6px',
        }}>
          OPENSTREETMAP NETWORK TOOL
        </span>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          🗺️ {step || 'OSM ROAD GEOMETRY DOWNLOAD'}
        </h2>
      </div>

      {/* Network Information Card */}
      <div style={{
        background: '#FFE600',
        color: '#000000',
        padding: '16px',
        border: '3px solid #000000',
        boxShadow: '4px 4px 0px #000000',
        marginBottom: '20px',
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>
          DOWNLOAD STATUS
        </h4>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 800 }}>
          {message || 'Successfully ingested road geometry.'}
        </p>
        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 900, background: '#000000', color: safe_mode ? '#FF007A' : '#00E676', padding: '8px', border: '2px solid #000' }}>
          {safe_mode ? '⚠️ Safe-Mode active. Synthetic map.osm ready for netconvert.' : `✓ Saved to ${file_path || 'simulation_data/map.osm'}`}
        </div>
      </div>

      {/* Next Step Agent Trigger */}
      <button
        onClick={() => sendFollowUpMessage && sendFollowUpMessage('Now run netconvert_osm tool to convert map.osm into SUMO network file network.net.xml.')}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#00F0FF',
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
        ⚡ CONVERT MAP TO SUMO NETWORK (NETCONVERT)
      </button>
    </div>
  );
};
