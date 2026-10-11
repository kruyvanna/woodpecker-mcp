import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateUserTool } from "./create-user";
import { registerDeleteUserTool } from "./delete-user";
import { registerGetUserTool } from "./get-user";
import { registerListUsersTool } from "./list-users";
import { registerUpdateUserTool } from "./update-user";

export const registerUsersTools = (server: McpServer) => {
  registerListUsersTool(server);
  registerGetUserTool(server);
  registerCreateUserTool(server);
  registerUpdateUserTool(server);
  registerDeleteUserTool(server);
};
