import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateForgeTool } from "./create-forge";
import { registerDeleteForgeTool } from "./delete-forge";
import { registerGetForgeTool } from "./get-forge";
import { registerListForgesTool } from "./list-forges";
import { registerUpdateForgeTool } from "./update-forge";

export const registerForgesTools = (server: McpServer) => {
  registerListForgesTool(server);
  registerGetForgeTool(server);
  registerCreateForgeTool(server);
  registerUpdateForgeTool(server);
  registerDeleteForgeTool(server);
};
