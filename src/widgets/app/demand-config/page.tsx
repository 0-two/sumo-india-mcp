'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';
import { DemandConfigSummary, DemandConfigProps } from '../../DemandConfigSummary';

export default function DemandConfigWidgetPage() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<DemandConfigProps>();

  if (!isReady) {
    return (
      <div style={{
        padding: '24px',
        background: '#FFE600',
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
        No traffic demand parameters received.
      </div>
    );
  }

  return <DemandConfigSummary {...data} />;
}
