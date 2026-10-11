import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateSecretTool } from "./create-secret";
import { registerDeleteSecretTool } from "./delete-secret";
import { registerGetSecretTool } from "./get-secret";
import { registerListSecretsTool } from "./list-secrets";
import { registerUpdateSecretTool } from "./update-secret";

export const registerSecretsTools = (server: McpServer) => {
  registerListSecretsTool(server);
  registerGetSecretTool(server);
  registerCreateSecretTool(server);
  registerUpdateSecretTool(server);
  registerDeleteSecretTool(server);
};
