'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';
import { OsmNetworkSummary, OsmNetworkProps } from '../../OsmNetworkSummary';

export default function OsmNetworkWidgetPage() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<OsmNetworkProps>();

  if (!isReady) {
    return (
      <div style={{
        padding: '24px',
        background: '#00F0FF',
        color: '#000',
        fontFamily: 'monospace',
        fontWeight: 800,
        textAlign: 'center',
        border: '3px solid #000'
      }}>
        Connecting to Host Studio...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        padding: '24px',
        background: '#FF007A',
        color: '#FFF',
        fontFamily: 'monospace',
        fontWeight: 800,
        textAlign: 'center',
        border: '3px solid #000'
      }}>
        No OSM network details received.
      </div>
    );
  }

  return <OsmNetworkSummary {...data} />;
}
