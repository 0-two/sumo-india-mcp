import { ControllerDecorator as Controller, ToolDecorator as Tool, Injectable, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';
import { CalibrationResource } from '../calibration/calibration.resource.js';
import { IndianVehicleProfiles } from '../calibration/types.js';

/**
 * SUMO Traffic Demand & Configuration Generator Controller
 * 
 * Injects Indian vehicle calibration presets and generates heterogeneous traffic demand
 * with non-lane discipline (lateral gap acceptance) enabled via SUMO sublane processing.
 */
@Controller('')
@Injectable()
export class GenerateDemandController {
  constructor(private readonly calibration: CalibrationResource) {}

  @Tool({
    name: 'generate_sumo_config',
    description: 'Programmatically generate heterogeneous Indian traffic demand (routes.rou.xml) and core simulation config (simulation.sumocfg) with sublane model lateral positioning enabled.',
    inputSchema: z.object({
      total_vehicles: z.number().int().positive().default(300).describe('Total number of vehicles to generate in the simulation traffic demand'),
      vehicle_mix: z.object({
        two_wheeler: z.number().min(0).max(100).default(50).describe('Percentage of two-wheelers (motorcycles/scooters) in traffic flow'),
        auto_rickshaw: z.number().min(0).max(100).default(20).describe('Percentage of auto-rickshaws in traffic flow'),
        passenger_car: z.number().min(0).max(100).default(20).describe('Percentage of passenger cars/taxis in traffic flow'),
        bus: z.number().min(0).max(100).default(10).describe('Percentage of buses in traffic flow'),
      }).describe('Percentage mix of Indian vehicle classes in the traffic pool (should sum to around 100)'),
    }),
  })
  async generateSumoConfig(
    input: {
      total_vehicles: number;
      vehicle_mix: {
        two_wheeler: number;
        auto_rickshaw: number;
        passenger_car: number;
        bus: number;
      };
    },
    ctx: ExecutionContext
  ) {
    ctx?.logger?.info(`[generate_sumo_config] Generating traffic demand for ${input.total_vehicles} vehicles...`);
    const simDir = path.join(process.cwd(), 'simulation_data');
    if (!fs.existsSync(simDir)) {
      fs.mkdirSync(simDir, { recursive: true });
    }

    // 1. Retrieve calibration profiles via DI
    const profiles: IndianVehicleProfiles = this.calibration.getProfiles();
    ctx?.logger?.info('Loaded vehicle calibration profiles from CalibrationResource via DI.');

    // 2. Extract available road edges from network.net.xml (if present from Phase 2)
    const netFilePath = path.join(simDir, 'network.net.xml');
    let validEdges: string[] = [];
    if (fs.existsSync(netFilePath)) {
      try {
        const netContent = fs.readFileSync(netFilePath, 'utf-8');
        // Match edge IDs that do not start with ':' (which represent SUMO internal junction lanes)
        const edgeRegex = /<edge\s+[^>]*id="([^":][^"]*)"/g;
        let match;
        while ((match = edgeRegex.exec(netContent)) !== null) {
          validEdges.push(match[1]);
        }
        ctx?.logger?.info(`Extracted ${validEdges.length} road edges from network.net.xml for random trip generation.`);
      } catch (err: any) {
        ctx?.logger?.warn(`Error reading edges from network.net.xml: ${err.message}. Using fallback edges.`);
      }
    }

    if (validEdges.length < 2) {
      ctx?.logger?.warn('Fewer than 2 valid road edges found in network.net.xml. Using default sample edge identifiers.');
      validEdges = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7'];
    }

    // 3. Construct vehicle pool based on vehicle_mix percentages
    const mix = input.vehicle_mix;
    const totalMix = mix.two_wheeler + mix.auto_rickshaw + mix.passenger_car + mix.bus || 100;
    
    const count2W = Math.round((mix.two_wheeler / totalMix) * input.total_vehicles);
    const countAuto = Math.round((mix.auto_rickshaw / totalMix) * input.total_vehicles);
    const countCar = Math.round((mix.passenger_car / totalMix) * input.total_vehicles);
    const countBus = Math.max(0, input.total_vehicles - (count2W + countAuto + countCar));

    const vehiclePool: (keyof IndianVehicleProfiles)[] = [
      ...Array(count2W).fill('two_wheeler'),
      ...Array(countAuto).fill('auto_rickshaw'),
      ...Array(countCar).fill('passenger_car'),
      ...Array(countBus).fill('bus'),
    ];

    // Shuffle vehicle pool for realistic heterogeneous arrival patterns
    for (let i = vehiclePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vehiclePool[i], vehiclePool[j]] = [vehiclePool[j], vehiclePool[i]];
    }

    // 4. Build routes.rou.xml file
    let routeXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    routeXml += `<!-- Indian Heterogeneous Traffic Demand - SUMO Routes Configuration -->\n`;
    routeXml += `<routes>\n`;

    // Write <vType> definitions from calibration profile
    for (const key of Object.keys(profiles) as (keyof IndianVehicleProfiles)[]) {
      const p = profiles[key];
      routeXml += `    <vType id="${key}" vClass="${p.vClass}" length="${p.length}" width="${p.width}" minGap="${p.minGap}" minGapLat="${p.minGapLat}" accel="${p.accel}" decel="${p.decel}" maxSpeed="${p.maxSpeed}"/>\n`;
    }
    routeXml += `\n`;

    // Write random <trip> entries across simulation timeframe (e.g. over 1800 seconds)
    const totalDuration = 1800; // 30 minutes simulation window
    const departStep = totalDuration / Math.max(1, vehiclePool.length);

    for (let i = 0; i < vehiclePool.length; i++) {
      const vType = vehiclePool[i];
      const depart = (i * departStep).toFixed(2);
      
      // Select random distinct start and destination edges
      const fromIdx = Math.floor(Math.random() * validEdges.length);
      let toIdx = Math.floor(Math.random() * validEdges.length);
      while (toIdx === fromIdx && validEdges.length > 1) {
        toIdx = Math.floor(Math.random() * validEdges.length);
      }
      
      const fromEdge = validEdges[fromIdx];
      const toEdge = validEdges[toIdx];

      routeXml += `    <trip id="veh_${i}" type="${vType}" depart="${depart}" from="${fromEdge}" to="${toEdge}"/>\n`;
    }
    routeXml += `</routes>\n`;

    const routesFilePath = path.join(simDir, 'routes.rou.xml');
    fs.writeFileSync(routesFilePath, routeXml, 'utf-8');
    ctx?.logger?.info(`Compiled traffic demand file to ${routesFilePath} (${vehiclePool.length} trips).`);

    // 5. Build simulation.sumocfg XML file with CRITICAL sublane lateral positioning block
    const sumocfgXml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- SUMO Core Configuration File for Indian Heterogeneous Traffic Simulation -->
<configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/sumoConfiguration.xsd">

    <input>
        <net-file value="network.net.xml"/>
        <route-files value="routes.rou.xml"/>
    </input>

    <time>
        <begin value="0"/>
        <end value="3600"/>
    </time>

    <processing>
        <lateral-resolution value="0.8"/>
        <ignore-route-errors value="true"/>
    </processing>

    <routing>
        <device.rerouting.probability value="1"/>
        <device.rerouting.period value="10"/>
    </routing>

    <report>
        <verbose value="true"/>
        <no-step-log value="true"/>
        <no-warnings value="true"/>
    </report>

</configuration>
`;

    const sumocfgFilePath = path.join(simDir, 'simulation.sumocfg');
    fs.writeFileSync(sumocfgFilePath, sumocfgXml, 'utf-8');
    ctx?.logger?.info(`Compiled SUMO simulation configuration file to ${sumocfgFilePath}.`);

    // 6. Return structured success result
    return {
      success: true,
      message: `Successfully generated SUMO traffic config files (routes.rou.xml with ${vehiclePool.length} trips and simulation.sumocfg with lateral resolution 0.8m) for heterogeneous Indian traffic simulation.`,
      config_summary: {
        total_vehicles: vehiclePool.length,
        breakdown: {
          two_wheeler: count2W,
          auto_rickshaw: countAuto,
          passenger_car: countCar,
          bus: countBus,
        },
        sublane_model: {
          enabled: true,
          lateral_resolution_m: 0.8,
        }
      },
      artifacts: {
        routes_file: routesFilePath,
        sumo_config_file: sumocfgFilePath,
      }
    };
  }
}
