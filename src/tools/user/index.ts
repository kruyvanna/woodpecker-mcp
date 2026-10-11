import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetCurrentUserTool } from "./get-current-user";
import { registerGetUserFeedTool } from "./get-user-feed";
import { registerListUserRepositoriesTool } from "./list-user-repositories";
import { registerSyncUserRepositoriesTool } from "./sync-user-repositories";

export const registerUserTools = (server: McpServer) => {
  registerGetCurrentUserTool(server);
  registerGetUserFeedTool(server);
  registerListUserRepositoriesTool(server);
  registerSyncUserRepositoriesTool(server);
};
