import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * OpenStreetMap & SUMO Network Tool Controller
 *
 * Fetches road network geometry from OpenStreetMap for a natural language location,
 * saves network.osm, and converts it to network.net.xml using SUMO netconvert.
 */
@Controller('')
export class FetchOsmController {
  @Tool({
    name: 'fetch_osm_network',
    description: 'Fetch OpenStreetMap (OSM) road network XML data for a location query and convert it into a SUMO network file (network.net.xml) using SUMO netconvert.',
    inputSchema: z.object({
      location_query: z.string().describe('Natural language location query, e.g., "Silk Board Junction, Bengaluru"'),
    }),
  })
  async fetchOsmNetwork(
    input: { location_query: string },
    ctx: ExecutionContext
  ): Promise<string> {
    const userAgent = 'NitroStack-SUMO-Hackathon/1.0';
    ctx?.logger?.info(`[fetch_osm_network] Geocoding location: "${input.location_query}"...`);

    try {
      // Step A (Geocoding): Call public Nominatim API to get the bounding box
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input.location_query)}&format=json&limit=1`;
      const nomRes = await axios.get(nomUrl, {
        headers: { 'User-Agent': userAgent },
        timeout: 10000,
      });

      if (!nomRes.data || !Array.isArray(nomRes.data) || nomRes.data.length === 0) {
        throw new Error(`Nominatim geocoding found no results for location: "${input.location_query}"`);
      }

      const firstResult = nomRes.data[0];
      const bbox = firstResult.boundingbox; // [latMin, latMax, lonMin, lonMax] as strings
      if (!bbox || !Array.isArray(bbox) || bbox.length < 4) {
        throw new Error(`Nominatim API returned invalid bounding box for location: "${input.location_query}"`);
      }

      const latMin = parseFloat(bbox[0]);
      const latMax = parseFloat(bbox[1]);
      const lonMin = parseFloat(bbox[2]);
      const lonMax = parseFloat(bbox[3]);

      // Step B (Overpass API): Convert bounding box format to south, west, north, east (latMin, lonMin, latMax, lonMax)
      const south = latMin;
      const west = lonMin;
      const north = latMax;
      const east = lonMax;

      ctx?.logger?.info(`[fetch_osm_network] Querying Overpass API for bbox: south=${south}, west=${west}, north=${north}, east=${east}...`);

      const overpassQuery = `[out:xml]; way(${south},${west},${north},${east})[highway]; (._;>;); out body;`;
      const overpassUrl = 'https://overpass.private.coffee/api/interpreter';

      let overpassRes;
      try {
        overpassRes = await axios.post(
          overpassUrl,
          `data=${encodeURIComponent(overpassQuery)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': userAgent,
            },
            timeout: 30000,
          }
        );
      } catch (err: any) {
        ctx?.logger?.warn(`Overpass POST form request failed: ${err.message}. Retrying with raw Overpass QL body...`);
        overpassRes = await axios.post(
          overpassUrl,
          overpassQuery,
          {
            headers: {
              'Content-Type': 'text/plain',
              'User-Agent': userAgent,
            },
            timeout: 30000,
          }
        );
      }

      const osmData = overpassRes.data;
      const osmContent = typeof osmData === 'string' ? osmData : JSON.stringify(osmData);

      if (!osmContent || !osmContent.includes('<osm')) {
        throw new Error(`Overpass API returned invalid OSM XML payload for location: "${input.location_query}"`);
      }

      // Save raw XML response locally to the root directory as network.osm (using Node's fs.promises)
      const rootOsmPath = path.join(process.cwd(), 'network.osm');
      await fs.promises.writeFile(rootOsmPath, osmContent, 'utf-8');

      // Sync to simulation_data directory if present or create it
      const simDir = path.join(process.cwd(), 'simulation_data');
      if (!fs.existsSync(simDir)) {
        await fs.promises.mkdir(simDir, { recursive: true });
      }
      await fs.promises.writeFile(path.join(simDir, 'network.osm'), osmContent, 'utf-8');

      ctx?.logger?.info(`[fetch_osm_network] Saved raw OSM XML to ${rootOsmPath}`);

      // Step C (SUMO Conversion): Run netconvert CLI command using child_process.exec wrapped in a Promise
      ctx?.logger?.info(`[fetch_osm_network] Running netconvert command...`);
      const netconvertCmd = `netconvert --osm-files network.osm -o network.net.xml --geometry.remove --ramps.guess`;

      try {
        await execAsync(netconvertCmd, { cwd: process.cwd() });
      } catch (execErr: any) {
        throw new Error(`netconvert execution failed: ${execErr.message}`);
      }

      const rootNetPath = path.join(process.cwd(), 'network.net.xml');
      if (!fs.existsSync(rootNetPath)) {
        throw new Error('netconvert command executed, but network.net.xml was not created in the root directory.');
      }

      // Sync compiled network to simulation_data directory as well
      await fs.promises.copyFile(rootNetPath, path.join(simDir, 'network.net.xml'));

      const locationName = firstResult.display_name || input.location_query;
      const successMsg = `Successfully generated network.net.xml for ${input.location_query}`;
      ctx?.logger?.info(`[fetch_osm_network] ${successMsg}`);

      return successMsg;
    } catch (error: any) {
      const errorMsg = `Failed to fetch and convert OSM network for "${input.location_query}": ${error.message}`;
      ctx?.logger?.error(`[fetch_osm_network] ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }
}
