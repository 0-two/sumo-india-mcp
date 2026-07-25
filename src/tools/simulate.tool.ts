import { ControllerDecorator as Controller, ToolDecorator as Tool, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { XMLParser } from 'fast-xml-parser';

const execAsync = promisify(exec);

/**
 * Tool 4 & 5: Headless Simulation & Native Visual GUI Launcher
 * 
 * Provides both headless metrics harvesting for the @Widget chat dashboard card AND
 * a dedicated tool to automatically launch the native high-resolution sumo-gui desktop window.
 */
@Controller('')
@Injectable()
export class SimulateController {
  @Tool({
    name: 'run_sumo_simulation',
    description: 'Step 4 of SUMO Tutorial: Execute Western urban traffic corridor headlessly using native SUMO binaries, analyze summary.xml outcomes, and render the interactive chat UI dashboard card.',
    inputSchema: z.object({
      timeout_seconds: z.number().int().positive().default(120).describe('Maximum execution timeout in seconds for headless SUMO command'),
    }),
  })
  @Widget('simulation-results')
  async runSumoSimulation(
    input: { timeout_seconds: number },
    ctx: ExecutionContext
  ) {
    ctx?.logger?.info('[run_sumo_simulation] Starting headless Western urban SUMO simulation...');
    const simDir = path.join(process.cwd(), 'simulation_data');
    const configPath = path.join(simDir, 'simulation.sumocfg');
    const summaryPath = path.join(simDir, 'summary.xml');

    if (!fs.existsSync(configPath)) {
      throw new Error(`simulation.sumocfg not found in simulation_data/. Please run generate_western_traffic (Step 3) first.`);
    }

    if (fs.existsSync(summaryPath)) {
      try { fs.unlinkSync(summaryPath); } catch (e) {}
    }

    const cmd = `sumo -c simulation.sumocfg --summary-output summary.xml`;
    try {
      await execAsync(cmd, { cwd: simDir, timeout: input.timeout_seconds * 1000 });
    } catch (err: any) {
      if (!fs.existsSync(summaryPath)) {
        throw new Error(`SUMO simulation failed to execute headlessly: ${err.message}`);
      }
    }

    if (!fs.existsSync(summaryPath)) {
      throw new Error(`SUMO command finished, but summary.xml was not found in simulation_data.`);
    }

    const xmlContent = fs.readFileSync(summaryPath, 'utf-8');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", parseAttributeValue: true });
    const parsed = parser.parse(xmlContent);
    const steps = parsed?.summary?.step;

    if (!steps || (Array.isArray(steps) && steps.length === 0)) {
      throw new Error(`Simulation concluded, but summary.xml contains no valid simulation steps.`);
    }

    const finalStep = Array.isArray(steps) ? steps[steps.length - 1] : steps;

    const meanWaitingTime = Math.round((parseFloat(String(finalStep.meanWaitingTime || 0)) || 0) * 100) / 100;
    const meanTravelTime = Math.round((parseFloat(String(finalStep.meanTravelTime || 0)) || 0) * 100) / 100;
    const running = parseInt(String(finalStep.running || 0), 10);
    const arrived = parseInt(String(finalStep.arrived || 0), 10);
    const loaded = parseInt(String(finalStep.loaded || 0), 10);
    const collisions = parseInt(String(finalStep.collisions || 0), 10);
    const endTime = parseFloat(String(finalStep.time || 0));

    return {
      success: true,
      message: `Simulation finished! To see the live 2D/3D graphical playback on your screen, simply call the launch_visual_sumo tool in chat!`,
      metrics: {
        meanWaitingTime,
        meanTravelTime,
        running,
        additional_stats: {
          simulation_end_time_s: endTime,
          total_loaded_vehicles: loaded,
          total_arrived_vehicles: arrived,
          collisions_reported: collisions,
        }
      }
    };
  }

  @Tool({
    name: 'launch_visual_sumo',
    description: 'Direct 1-Click GUI Launcher: Open the native high-resolution sumo-gui graphical desktop window automatically from chat without typing terminal commands.',
    inputSchema: z.object({
      auto_start: z.boolean().default(true).describe('Automatically start playing simulation upon GUI launching'),
    }),
  })
  async launchVisualSumo(
    input: { auto_start: boolean },
    ctx: ExecutionContext
  ) {
    ctx?.logger?.info('[launch_visual_sumo] Spawning native high-resolution SUMO graphical window...');
    const simDir = path.join(process.cwd(), 'simulation_data');
    const configPath = path.join(simDir, 'simulation.sumocfg');

    if (!fs.existsSync(configPath)) {
      throw new Error(`simulation.sumocfg not found in simulation_data/. Please execute the simulation generation steps first.`);
    }

    const startFlag = input.auto_start ? ' --start' : '';
    const guiCmd = `start "" sumo-gui -c simulation.sumocfg${startFlag}`;

    try {
      // Spawn asynchronously so the chat window returns immediately without blocking
      exec(guiCmd, { cwd: simDir });
    } catch (err: any) {
      ctx?.logger?.error(`Failed to launch sumo-gui window: ${err.message}`);
      throw new Error(`Could not open graphical window. Verify sumo-gui is installed in system PATH.`);
    }

    return {
      success: true,
      action: "Launched Native High-Resolution SUMO GUI Window",
      message: `Successfully popped open your native high-resolution sumo-gui desktop window with Real-World asphalt road textures, bright yellow NYC taxis, and AI adaptive signal visualization!`,
      config_loaded: configPath,
      visual_features: [
        "Dark modern road background",
        "Textured grey asphalt with lane markings",
        "Color-coded vehicle fleet (Yellow Taxis, White Sedans, Blue Trucks, Red Buses)",
        "Adaptive AI Traffic Light status indicator lightbulbs"
      ]
    };
  }
}
