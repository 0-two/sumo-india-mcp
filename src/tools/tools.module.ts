import { Module } from '@nitrostack/core';
import { FetchOsmController } from './fetchOsmTool.js';
import { GenerateDemandController } from './generateDemandTool.js';
import { RunSimController } from './runSimTool.js';
import { CalibrationModule } from '../calibration/calibration.module.js';

/**
 * Tools Module
 * 
 * Aggregates all simulation orchestration tools, linking OSM road network extraction,
 * traffic demand modeling, headless simulation runner, and Indian vehicle calibration.
 */
@Module({
  name: 'tools',
  description: 'Simulation orchestration tools including OpenStreetMap ingestion, demand modeling, and headless SUMO execution',
  imports: [CalibrationModule],
  controllers: [FetchOsmController, GenerateDemandController, RunSimController],
  providers: [FetchOsmController, GenerateDemandController, RunSimController],
  exports: [FetchOsmController, GenerateDemandController, RunSimController],
})
export class ToolsModule {}



