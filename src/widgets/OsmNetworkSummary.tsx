'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';

export interface OsmNetworkProps {
  success?: boolean;
  message?: string;
  network_details?: {
    location_query: string;
    display_name?: string;
    bbox?: number[];
    osm_file?: string;
    net_file?: string;
  };
}

/**
 * Neo-Brutalism OsmNetworkSummary Component
 * 
 * Displays OpenStreetMap network import status and bounding box info.
 */
export const OsmNetworkSummary: React.FC<OsmNetworkProps> = ({ success, message, network_details }) => {
  const { sendFollowUpMessage } = useWidgetSDK();

  const queryName = network_details?.location_query || 'Target Location';
  const displayName = network_details?.display_name || message || 'OpenStreetMap Network Processed';

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
          🗺️ {queryName}
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
          COMPILED NETWORK STATUS
        </h4>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 800 }}>
          {displayName}
        </p>
        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 900, background: '#000000', color: '#00E676', padding: '8px', border: '2px solid #000' }}>
          ✓ Saved network.net.xml with SUMO Netconvert geometry cleanup & ramp guessing.
        </div>
      </div>

      {/* Next Step Agent Trigger */}
      <button
        onClick={() => sendFollowUpMessage && sendFollowUpMessage(`Generate traffic demand for ${queryName} using generate_sumo_config.`)}
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
        ⚡ GENERATE TRAFFIC DEMAND FOR THIS LOCATION
      </button>
    </div>
  );
};
