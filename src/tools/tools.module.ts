import { Module } from '@nitrostack/core';
import { OsmDownloadController } from './osmDownload.tool.js';
import { UploadOsmController } from './uploadOsm.tool.js';
import { NetconvertController } from './netconvert.tool.js';
import { AiSignalOptimizerController } from './aiSignalOptimizer.tool.js';
import { TrafficDemandController } from './trafficDemand.tool.js';
import { SimulateController } from './simulate.tool.js';
import { CalibrationModule } from '../calibration/calibration.module.js';

/**
 * Tools Module
 * 
 * Registers our complete suite of 6 Western urban simulation tools:
 * Option 1 (API Ingestion), Option 2 (Local File Upload), High-Res Netconvert, AI Signal Optimizer,
 * Traffic Demand Generator, Headless Simulator Widget, and Native GUI Launcher.
 */
@Module({
  name: 'tools',
  description: 'Complete Western urban simulation tool suite with OSM uploads, AI traffic light green-waves, and automated visual GUI launching',
  imports: [CalibrationModule],
  controllers: [
    OsmDownloadController,
    UploadOsmController,
    NetconvertController,
    AiSignalOptimizerController,
    TrafficDemandController,
    SimulateController,
  ],
  providers: [
    OsmDownloadController,
    UploadOsmController,
    NetconvertController,
    AiSignalOptimizerController,
    TrafficDemandController,
    SimulateController,
  ],
  exports: [
    OsmDownloadController,
    UploadOsmController,
    NetconvertController,
    AiSignalOptimizerController,
    TrafficDemandController,
    SimulateController,
  ],
})
export class ToolsModule {}
