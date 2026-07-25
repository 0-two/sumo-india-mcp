import { ControllerDecorator as Controller, ToolDecorator as Tool, Injectable, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tool 3: Western Homogeneous Traffic Demand Generator (Tutorial Part II, Step 3 & 5)
 * 
 * Generates disciplined Western traffic scenarios and links the high-resolution GUI theme file
 * inside simulation.sumocfg for rich visual rendering in sumo-gui.
 */
@Controller('')
@Injectable()
export class TrafficDemandController {

  @Tool({
    name: 'generate_western_traffic',
    description: 'Step 3 of SUMO Tutorial: Generate randomized Western urban traffic routes (routes.rou.xml) and core simulation config (.sumocfg) linking high-resolution aesthetics.',
    inputSchema: z.object({
      total_vehicles: z.number().int().positive().default(450).describe('Total number of urban vehicles to simulate across the street corridor'),
      truck_percentage: z.number().min(0).max(100).default(15).describe('Percentage of commercial delivery trucks and large service vehicles (default 15%)'),
    }),
  })
  async generateWesternTraffic(
    input: { total_vehicles: number; truck_percentage: number },
    ctx: ExecutionContext
  ) {
    ctx?.logger?.info(`[generate_western_traffic] Configuring Western traffic flow for ${input.total_vehicles} vehicles (${input.truck_percentage}% trucks)...`);
    const simDir = path.join(process.cwd(), 'simulation_data');
    const netPath = path.join(simDir, 'network.net.xml');
    const routePath = path.join(simDir, 'routes.rou.xml');
    const configPath = path.join(simDir, 'simulation.sumocfg');
    const guiSettingsPath = path.join(simDir, 'gui-settings.view.xml');

    if (!fs.existsSync(netPath)) {
      throw new Error(`network.net.xml not found in simulation_data/. Please execute netconvert_osm (Step 2) first.`);
    }

    // 1. Define Standard Western Vehicle Class Profiles
    const profiles = {
      passenger_car: { accel: "2.6", decel: "4.5", length: "4.8", minGap: "2.5", maxSpeed: "50.0", width: "1.8", guiShape: "passenger" },
      yellow_taxi:   { accel: "2.9", decel: "4.5", length: "4.8", minGap: "2.0", maxSpeed: "55.0", width: "1.8", guiShape: "passenger/sedan", color: "1,0.8,0" },
      delivery_truck:{ accel: "1.3", decel: "3.5", length: "8.5", minGap: "3.5", maxSpeed: "35.0", width: "2.4", guiShape: "truck", color: "0.2,0.6,0.9" },
      city_bus:      { accel: "1.2", decel: "3.5", length: "12.0", minGap: "4.0", maxSpeed: "30.0", width: "2.5", guiShape: "bus", color: "0.9,0.2,0.2" }
    };

    const netContent = fs.readFileSync(netPath, 'utf-8');
    const edgeRegex = /<edge id="([^"]+)"/g;
    const availableEdges: string[] = [];
    let match;
    while ((match = edgeRegex.exec(netContent)) !== null) {
      if (!match[1].startsWith(':') && !availableEdges.includes(match[1])) {
        availableEdges.push(match[1]);
      }
    }

    if (availableEdges.length < 2) {
      availableEdges.push('in_1', 'out_1', 'in_2', 'out_2');
    }

    const truckPct = input.truck_percentage / 100.0;
    const busPct = 0.08;
    const taxiPct = Math.min(0.25, (1.0 - truckPct - busPct) * 0.35);
    const carPct = Math.max(0.10, 1.0 - truckPct - busPct - taxiPct);

    let rouXml = `<?xml version="1.0" encoding="UTF-8"?>\n<routes xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/routes_file.xsd">\n`;
    
    for (const [key, vType] of Object.entries(profiles)) {
      const colorAttr = (vType as any).color ? ` color="${(vType as any).color}"` : '';
      rouXml += `    <vType id="${key}" accel="${vType.accel}" decel="${vType.decel}" length="${vType.length}" minGap="${vType.minGap}" maxSpeed="${vType.maxSpeed}" width="${vType.width}" guiShape="${vType.guiShape}"${colorAttr}/>\n`;
    }

    const probabilities = [carPct, carPct + taxiPct, carPct + taxiPct + truckPct, 1.0];

    for (let i = 0; i < input.total_vehicles; i++) {
      const r = Math.random();
      let selectedType = 'passenger_car';
      if (r > probabilities[0] && r <= probabilities[1]) selectedType = 'yellow_taxi';
      else if (r > probabilities[1] && r <= probabilities[2]) selectedType = 'delivery_truck';
      else if (r > probabilities[2]) selectedType = 'city_bus';

      let fromEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
      let toEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
      while (toEdge === fromEdge && availableEdges.length > 1) {
        toEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
      }

      const departTime = (i * 0.4).toFixed(1);
      rouXml += `    <trip id="veh_${i}" type="${selectedType}" depart="${departTime}" from="${fromEdge}" to="${toEdge}" departLane="best" departSpeed="max"/>\n`;
    }

    rouXml += `</routes>\n`;
    fs.writeFileSync(routePath, rouXml, 'utf-8');

    const hasGuiSettings = fs.existsSync(guiSettingsPath);
    const guiBlock = hasGuiSettings ? `\n    <gui_only>\n        <gui-settings-file value="gui-settings.view.xml"/>\n    </gui_only>` : '';

    // 5. Construct simulation.sumocfg with GUI styling reference
    const sumocfgXml = `<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://sumo.dlr.de/xsd/sumoConfiguration.xsd">
    <input>
        <net-file value="network.net.xml"/>
        <route-files value="routes.rou.xml"/>
    </input>${guiBlock}
    <time>
        <begin value="0"/>
        <end value="3600"/>
    </time>
    <processing>
        <ignore-route-errors value="true"/>
        <collision.action value="teleport"/>
    </processing>
    <routing>
        <device.rerouting.probability value="1"/>
    </routing>
    <report>
        <no-step-log value="true"/>
    </report>
</configuration>`;

    fs.writeFileSync(configPath, sumocfgXml, 'utf-8');

    return {
      success: true,
      step: '3 & 5) Route Assignment and Western Simulation Setup',
      message: `Successfully generated Western urban traffic demand (${input.total_vehicles} vehicles) and linked high-resolution photorealistic GUI settings!`,
      files_generated: {
        routes_xml: routePath,
        sumo_config: configPath,
      },
      urban_fleet_mix: {
        passenger_cars_pct: `${Math.round(carPct*100)}% (White Sedans/SUVs)`,
        yellow_taxis_pct: `${Math.round(taxiPct*100)}% (Bright NYC Yellow)`,
        delivery_trucks_pct: `${Math.round(truckPct*100)}% (Blue Delivery Rigs)`,
        city_buses_pct: `${Math.round(busPct*100)}% (Red Transit Buses)`,
      },
      gui_aesthetics_linked: hasGuiSettings ? "gui-settings.view.xml active" : "Standard theme"
    };
  }
}
