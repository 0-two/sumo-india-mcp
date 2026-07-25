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
 * Provides intelligent ingestion of real-world Indian road network geometries from OpenStreetMap
 * and translates them into headless SUMO simulation networks via netconvert.
 */
@Controller('')
export class FetchOsmController {
  @Tool({
    name: 'fetch_osm_network',
    description: 'Fetch OpenStreetMap (OSM) road network XML data for a location in India and compile it into an accurate SUMO network file (network.net.xml) using SUMO netconvert.',
    inputSchema: z.object({
      city: z.string().describe('City name in India, e.g., Bengaluru, Mumbai, or Delhi'),
      location_query: z.string().describe('Specific road, corridor, or junction query within the city, e.g., Outer Ring Road or Silk Board Junction'),
    }),
  })
  async fetchOsmNetwork(
    input: { city: string; location_query: string },
    ctx: ExecutionContext
  ) {
    const fullQuery = `${input.location_query}, ${input.city}, India`;
    ctx?.logger?.info(`[fetch_osm_network] Initiating OSM ingestion for query: "${fullQuery}"`);

    // Default bounding box fallback (e.g., typical urban stretch in Bengaluru) if geocoding fails
    let south = 12.9100;
    let west = 77.6200;
    let north = 12.9300;
    let east = 77.6400;

    // 1. Geocode Location to Bounding Box via Nominatim
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=1`;
      ctx?.logger?.info(`Querying Nominatim API for bounding coordinates...`);
      
      const nomRes = await axios.get(nomUrl, {
        headers: { 'User-Agent': 'SUMO-India-MCP-Calibration-Layer/1.0 (Hackathon)' },
        timeout: 10000,
      });

      if (nomRes.data && Array.isArray(nomRes.data) && nomRes.data.length > 0) {
        const result = nomRes.data[0];
        const bbox = result.boundingbox; // [south, north, west, east] as strings
        
        if (bbox && bbox.length === 4) {
          const s = parseFloat(bbox[0]);
          const n = parseFloat(bbox[1]);
          const w = parseFloat(bbox[2]);
          const e = parseFloat(bbox[3]);

          // Protect simulation from excessive Overpass memory & netconvert build times during hackathon demo:
          // If bounding box exceeds 0.04 degrees (~4km), center a clean 3 km x 3 km window around centroid.
          if (Math.abs(n - s) > 0.04 || Math.abs(e - w) > 0.04) {
            const centerLat = parseFloat(result.lat) || (s + n) / 2;
            const centerLon = parseFloat(result.lon) || (w + e) / 2;
            south = centerLat - 0.015;
            north = centerLat + 0.015;
            west = centerLon - 0.015;
            east = centerLon + 0.015;
            ctx?.logger?.info(`Target region is large. Constrained bounding box to ~3x3 km around (${centerLat.toFixed(4)}, ${centerLon.toFixed(4)}) for rapid SUMO simulation.`);
          } else {
            south = Math.min(s, n);
            north = Math.max(s, n);
            west = Math.min(w, e);
            east = Math.max(w, e);
          }
        }
      } else {
        ctx?.logger?.warn(`Nominatim could not accurately resolve "${fullQuery}". Defaulting to Bengaluru urban traffic corridor coordinates.`);
      }
    } catch (nomErr: any) {
      ctx?.logger?.warn(`Nominatim Geocoding API lookup failed: ${nomErr.message}. Proceeding with fallback urban coordinates.`);
    }

    // 2. Fetch Raw OSM XML Data from Overpass API
    const overpassQuery = `[out:xml][timeout:60];
(
  way["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|secondary_link|primary_link|trunk_link|motorway_link"](${south},${west},${north},${east});
  node(w);
);
out body;`;

    ctx?.logger?.info(`Fetching road network from Overpass API [bbox: ${south.toFixed(4)}, ${west.toFixed(4)}, ${north.toFixed(4)}, ${east.toFixed(4)}]...`);
    
    let osmXmlData: string;
    try {
      const overpassRes = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 70000,
      });

      osmXmlData = overpassRes.data;
      if (typeof osmXmlData !== 'string' || !osmXmlData.includes('<osm')) {
        throw new Error('Received invalid or malformed XML response from Overpass API.');
      }
    } catch (overpassErr: any) {
      const errorMsg = overpassErr.response?.data ? String(overpassErr.response.data) : overpassErr.message;
      ctx?.logger?.error(`Overpass API fetch failed: ${errorMsg}`);
      throw new Error(`Overpass API road network query failed for "${fullQuery}": ${errorMsg}`);
    }

    // 3. Save network.osm to Local Working Directory
    const simDir = path.join(process.cwd(), 'simulation_data');
    if (!fs.existsSync(simDir)) {
      fs.mkdirSync(simDir, { recursive: true });
    }

    const osmFilePath = path.join(simDir, 'network.osm');
    const netXmlFilePath = path.join(simDir, 'network.net.xml');

    try {
      fs.writeFileSync(osmFilePath, osmXmlData, 'utf-8');
      ctx?.logger?.info(`Successfully written raw OSM network file to ${osmFilePath} (${Math.round(osmXmlData.length / 1024)} KB).`);
    } catch (writeErr: any) {
      throw new Error(`Failed to write network.osm file to disk: ${writeErr.message}`);
    }

    // 4. Invoke SUMO netconvert via child_process
    const netconvertCmd = `netconvert --osm-files network.osm -o network.net.xml --geometry.remove --ramps.guess`;
    ctx?.logger?.info(`Executing SUMO command: ${netconvertCmd}`);

    try {
      const { stdout, stderr } = await execAsync(netconvertCmd, { cwd: simDir });
      if (stderr && !fs.existsSync(netXmlFilePath)) {
        ctx?.logger?.warn(`netconvert compiler messages: ${stderr}`);
      }
    } catch (execErr: any) {
      ctx?.logger?.error(`netconvert execution failed: ${execErr.message}`);
      throw new Error(
        `SUMO netconvert command failed. Ensure SUMO traffic simulation binaries are installed locally and available in system PATH. Details: ${execErr.message}`
      );
    }

    if (!fs.existsSync(netXmlFilePath)) {
      throw new Error('SUMO netconvert command executed, but network.net.xml file was not found in simulation directory.');
    }

    const compiledSizeKb = Math.round(fs.statSync(netXmlFilePath).size / 1024);
    ctx?.logger?.info(`Successfully compiled SUMO network file: network.net.xml (${compiledSizeKb} KB).`);

    // 5. Return Structured Success Notice
    return {
      success: true,
      message: `Successfully generated SUMO simulation network (network.net.xml, ${compiledSizeKb} KB) from OpenStreetMap road geometry for "${input.location_query}, ${input.city}".`,
      location: {
        city: input.city,
        query: input.location_query,
        bounding_box: { south, west, north, east },
      },
      artifacts: {
        osm_source_file: osmFilePath,
        sumo_network_file: netXmlFilePath,
      }
    };
  }
}
