import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ControllerDecorator as Controller, Injectable, ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { IndianVehicleProfiles, SumoVehicleType } from './types.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Calibration Resource Service
 *
 * Exposes literature-backed Indian traffic parameter presets as an MCP Resource
 * and provides typed accessor methods for dependency injection into simulation tools.
 */
@Controller('')
@Injectable()
export class CalibrationResource {

  private readonly profiles: IndianVehicleProfiles;

  constructor() {
    const jsonPath = path.join(__dirname, 'indian_vtypes.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    this.profiles = JSON.parse(rawData) as IndianVehicleProfiles;
  }

  /**
   * MCP Resource exposing available calibration profiles to the LLM agent.
   */
  @Resource({
    uri: 'calibration://indian_vtypes',
    name: 'Indian Traffic Vehicle Type Presets',
    description: 'Literature-backed physical and behavioral parameter presets for Indian traffic classes (two_wheeler, auto_rickshaw, passenger_car, bus) optimized for SUMO sublane models and non-lane discipline.',
    mimeType: 'application/json',
  })
  async getIndianVTypesResource(ctx?: ExecutionContext): Promise<IndianVehicleProfiles> {
    ctx?.logger?.info('Serving calibration://indian_vtypes resource to LLM client');
    return this.profiles;
  }

  /**
   * Retrieve all vehicle profiles synchronously for backend tools via DI.
   */
  getProfiles(): IndianVehicleProfiles {
    return this.profiles;
  }

  /**
   * Retrieve a specific vehicle profile by its vehicle class identifier.
   */
  getProfile(vehicleClass: keyof IndianVehicleProfiles): SumoVehicleType {
    const profile = this.profiles[vehicleClass];
    if (!profile) {
      throw new Error(`Unknown Indian vehicle class calibration: ${vehicleClass}`);
    }
    return profile;
  }
}
