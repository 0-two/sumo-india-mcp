'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';
import { SimulationSummary, SimulationSummaryProps } from '../../SimulationSummary';

/**
 * Simulation Results Widget Route Page
 *
 * Hooks into the @nitrostack/widgets host context to receive tool output data
 * from run_simulation and dynamically renders the simulation metrics card.
 */
export default function SimulationResultsPage() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<SimulationSummaryProps>();

  if (!isReady) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: '#94a3b8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
      }}>
        Connecting to NitroStack host studio...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: '#f87171',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        background: '#1f1215',
        borderRadius: '12px',
        border: '1px solid rgba(248, 113, 113, 0.2)',
      }}>
        No simulation metrics output received from tool execution.
      </div>
    );
  }

  return <SimulationSummary {...data} />;
}
