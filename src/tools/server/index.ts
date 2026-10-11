import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetLogLevelTool } from "./get-log-level";
import { registerGetServerInfoTool } from "./get-server-info";
import { registerGetSignaturePublicKeyTool } from "./get-signature-public-key";
import { registerSetLogLevelTool } from "./set-log-level";

export const registerServerTools = (server: McpServer) => {
  registerGetServerInfoTool(server);
  registerGetLogLevelTool(server);
  registerSetLogLevelTool(server);
  registerGetSignaturePublicKeyTool(server);
};
