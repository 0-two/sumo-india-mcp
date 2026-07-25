import { Module } from '@nitrostack/core';
import { CalibrationResource } from './calibration.resource.js';

/**
 * Calibration Module
 * 
 * Encapsulates Indian traffic simulation parameters and exports the CalibrationResource
 * so feature tools can inject and consume accurate vehicle dimension & behavioral presets.
 */
@Module({
  name: 'calibration',
  description: 'Indian traffic calibration layer providing heterogeneous vehicle presets for SUMO',
  controllers: [CalibrationResource],
  providers: [CalibrationResource],
  exports: [CalibrationResource],
})
export class CalibrationModule {}

