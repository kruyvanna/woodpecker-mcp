import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateRegistryTool } from "./create-registry";
import { registerDeleteRegistryTool } from "./delete-registry";
import { registerGetRegistryTool } from "./get-registry";
import { registerListRegistriesTool } from "./list-registries";
import { registerUpdateRegistryTool } from "./update-registry";

export const registerRegistriesTools = (server: McpServer) => {
  registerListRegistriesTool(server);
  registerGetRegistryTool(server);
  registerCreateRegistryTool(server);
  registerUpdateRegistryTool(server);
  registerDeleteRegistryTool(server);
};
