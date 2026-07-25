import { ControllerDecorator as Controller, ToolDecorator as Tool, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { XMLParser } from 'fast-xml-parser';

const execAsync = promisify(exec);

/**
 * Headless SUMO Simulation Runner Controller
 *
 * Executes simulated traffic scenarios headlessly using native SUMO binaries and extracts
 * structured traffic outcome metrics from summary XML reports.
 */
@Controller('')
@Injectable()
export class RunSimController {
  @Tool({
    name: 'run_simulation',
    description: 'Execute SUMO traffic simulation headlessly using simulation.sumocfg, parse summary.xml outcomes, and return key physical metrics (meanWaitingTime, meanTravelTime, running vehicles).',
    inputSchema: z.object({
      timeout_seconds: z.number().int().positive().default(120).describe('Maximum execution timeout in seconds for headless SUMO simulation'),
    }),
  })
  @Widget('simulation-results')
  async runSimulation(

    input: { timeout_seconds: number },
    ctx: ExecutionContext
  ) {
    ctx?.logger?.info('[run_simulation] Initiating headless SUMO simulation execution...');
    const simDir = path.join(process.cwd(), 'simulation_data');
    const configPath = path.join(simDir, 'simulation.sumocfg');
    const summaryPath = path.join(simDir, 'summary.xml');

    // 1. Validate configuration readiness
    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Simulation configuration file not found at ${configPath}. Please execute generate_sumo_config tool first before invoking run_simulation.`
      );
    }

    // Remove old summary report if it exists from previous run
    if (fs.existsSync(summaryPath)) {
      try {
        fs.unlinkSync(summaryPath);
      } catch (err: any) {
        ctx?.logger?.warn(`Could not remove prior summary.xml: ${err.message}`);
      }
    }

    // 2. Execute SUMO headlessly via child_process
    const sumoCmd = `sumo -c simulation.sumocfg --summary-output summary.xml`;
    ctx?.logger?.info(`Running headless SUMO command in ${simDir}: ${sumoCmd}`);

    try {
      const { stdout, stderr } = await execAsync(sumoCmd, {
        cwd: simDir,
        timeout: input.timeout_seconds * 1000,
      });

      if (stderr && !fs.existsSync(summaryPath)) {
        ctx?.logger?.warn(`SUMO simulation notices: ${stderr}`);
      }
    } catch (execErr: any) {
      ctx?.logger?.error(`Headless SUMO simulation execution error: ${execErr.message}`);
      throw new Error(
        `SUMO simulation failed to run headlessly. Verify that native SUMO binaries are installed and accessible in system PATH. Details: ${execErr.message}`
      );
    }

    // 3. Verify and parse summary.xml output using fast-xml-parser
    if (!fs.existsSync(summaryPath)) {
      throw new Error('SUMO command completed, but summary.xml was not generated in simulation directory.');
    }

    ctx?.logger?.info(`Reading simulation outcomes from ${summaryPath}...`);
    const xmlContent = fs.readFileSync(summaryPath, 'utf-8');
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      parseAttributeValue: true,
    });
    
    const parsedData = parser.parse(xmlContent);
    const steps = parsedData?.summary?.step;

    if (!steps || (Array.isArray(steps) && steps.length === 0)) {
      throw new Error('Simulation completed but summary.xml contains no valid simulation step entries.');
    }

    // Extract the final step entry
    const finalStep = Array.isArray(steps) ? steps[steps.length - 1] : steps;

    // 4. Extract key metrics: meanWaitingTime, meanTravelTime, and running
    const meanWaitingTime = Math.round((parseFloat(String(finalStep.meanWaitingTime || 0)) || 0) * 100) / 100;
    const meanTravelTime = Math.round((parseFloat(String(finalStep.meanTravelTime || 0)) || 0) * 100) / 100;
    const running = parseInt(String(finalStep.running || 0), 10);

    // Extract additional diagnostic metrics if available
    const arrived = parseInt(String(finalStep.arrived || 0), 10);
    const loaded = parseInt(String(finalStep.loaded || 0), 10);
    const collisions = parseInt(String(finalStep.collisions || 0), 10);
    const timeStep = parseFloat(String(finalStep.time || 0));

    ctx?.logger?.info(`Simulation concluded at t=${timeStep}s. Metrics -> meanWaitingTime: ${meanWaitingTime}s, meanTravelTime: ${meanTravelTime}s, running: ${running}, arrived: ${arrived}`);

    // 5. Return structured JSON metrics for LLM decision reasoning
    return {
      success: true,
      message: `Headless SUMO Indian heterogeneous traffic simulation completed successfully at t=${timeStep}s. Final step performance metrics extracted.`,
      metrics: {
        meanWaitingTime,
        meanTravelTime,
        running,
        additional_stats: {
          simulation_end_time_s: timeStep,
          total_loaded_vehicles: loaded,
          total_arrived_vehicles: arrived,
          collisions_reported: collisions,
        }
      },
      artifacts: {
        summary_xml: summaryPath,
        sumo_config: configPath,
      }
    };
  }
}
