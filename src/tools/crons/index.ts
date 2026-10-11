import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateCronTool } from "./create-cron";
import { registerDeleteCronTool } from "./delete-cron";
import { registerGetCronTool } from "./get-cron";
import { registerListCronsTool } from "./list-crons";
import { registerRunCronTool } from "./run-cron";
import { registerUpdateCronTool } from "./update-cron";

export const registerCronsTools = (server: McpServer) => {
  registerListCronsTool(server);
  registerGetCronTool(server);
  registerCreateCronTool(server);
  registerUpdateCronTool(server);
  registerDeleteCronTool(server);
  registerRunCronTool(server);
};
