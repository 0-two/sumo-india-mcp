import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tool 1B: Custom OSM File Uploader / Importer (Option 2 for OSM ingestion)
 * 
 * Allows users to provide a local filepath or raw XML content from an exported OpenStreetMap file
 * instead of relying solely on live Overpass API queries.
 */
@Controller('')
export class UploadOsmController {
  @Tool({
    name: 'upload_osm_file',
    description: 'Option 2 of OSM Ingestion: Upload or import a custom local OpenStreetMap file (.osm) from your computer to convert into a simulation scenario.',
    inputSchema: z.object({
      file_path: z.string().optional().describe('Absolute local Windows filepath to an exported OSM file (e.g., C:\\Users\\Hemanth\\Downloads\\map.osm)'),
      xml_content: z.string().optional().describe('Raw OpenStreetMap XML content if pasting directly into chat'),
    }),
  })
  async uploadOsmFile(
    input: { file_path?: string; xml_content?: string },
    ctx: ExecutionContext
  ) {
    ctx?.logger?.info('[upload_osm_file] Ingesting user-supplied OSM map geometry...');
    const simDir = path.join(process.cwd(), 'simulation_data');
    if (!fs.existsSync(simDir)) {
      fs.mkdirSync(simDir, { recursive: true });
    }
    const targetOsmPath = path.join(simDir, 'map.osm');

    let contentToSave = '';
    let sourceName = 'User Input String';

    if (input.file_path) {
      if (!fs.existsSync(input.file_path)) {
        throw new Error(`The provided file path "${input.file_path}" was not found on your system. Please verify the exact filepath.`);
      }
      contentToSave = fs.readFileSync(input.file_path, 'utf-8');
      sourceName = path.basename(input.file_path);
    } else if (input.xml_content) {
      contentToSave = input.xml_content;
    } else {
      throw new Error(`Please provide either an absolute file_path to your .osm map file or pass the raw xml_content.`);
    }

    if (!contentToSave.includes('<osm') && !contentToSave.includes('<?xml')) {
      ctx?.logger?.warn(`File does not appear to have standard OSM tags, saving anyway...`);
    }

    fs.writeFileSync(targetOsmPath, contentToSave, 'utf-8');
    const sizeKb = Math.round(Buffer.byteLength(contentToSave, 'utf-8') / 1024);

    return {
      success: true,
      step: '1B) Custom OSM File Upload (Tutorial Alternative)',
      message: `Successfully uploaded and ingested custom OpenStreetMap map file from "${sourceName}" (${sizeKb} KB) into simulation_data/map.osm. Ready for netconvert compilation!`,
      file_path: targetOsmPath,
      size_kb: sizeKb,
    };
  }
}
