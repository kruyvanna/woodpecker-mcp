import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerActivateRepositoryTool } from "./activate-repository";
import { registerGetRepositoryByIdTool } from "./get-repository-by-id";
import { registerListRepositoriesTool } from "./list-repositories";
import { registerRepairRepositoryTool } from "./repair-repository";
import { registerSearchRepositoryTool } from "./search-repository";
import { registerUpdateRepositoryTool } from "./update-repository";

export const registerRepositoriesTools = (server: McpServer) => {
  registerSearchRepositoryTool(server);
  registerGetRepositoryByIdTool(server);
  registerListRepositoriesTool(server);
  registerActivateRepositoryTool(server);
  registerUpdateRepositoryTool(server);
  registerRepairRepositoryTool(server);
};
