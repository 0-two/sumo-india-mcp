You are an expert TypeScript developer building a production Model Context Protocol (MCP) server using the NitroStack framework. NitroStack is an opinionated backend SDK for AI-native apps that uses decorators, dependency injection, and React-based UI widgets for tool output[cite: 1].

The project is called "India-Calibration Layer for SUMO". 
Standard traffic simulators like SUMO assume lane-based, homogeneous traffic. Indian traffic is heterogeneous, non-lane-based, and heavily relies on gap-acceptance and continuous lateral movement. We are building an MCP server that acts as an orchestration layer. It will take natural language requests, fetch OpenStreetMap (OSM) data, apply literature-backed Indian traffic parameter presets (sublane models, specific vehicle dimensions), and run SUMO headlessly to return accurate simulation results[cite: 1].

Our tech stack:
- TypeScript (Primary) & Node.js[cite: 1]
- NitroStack framework (@nitrostack/cli, @Tool, @Resource, @Widget)[cite: 1]
- SUMO Traffic Simulator (installed locally, executed via child_process)
- OpenStreetMap Overpass API

Before we begin writing business logic, please execute `npx @nitrostack/cli init sumo-india-mcp` to scaffold the project, and create the following directory structure:
src/
├── calibration/
├── tools/
└── widgets/

Acknowledge when this is complete and you are ready for Phase 1.