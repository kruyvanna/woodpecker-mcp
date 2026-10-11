import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDeleteOrgTool } from "./delete-org";
import { registerGetOrgTool } from "./get-org";
import { registerGetOrgPermissionsTool } from "./get-org-permissions";
import { registerListOrgsTool } from "./list-orgs";
import { registerLookupOrgTool } from "./lookup-org";

export const registerOrgsTools = (server: McpServer) => {
  registerListOrgsTool(server);
  registerGetOrgTool(server);
  registerLookupOrgTool(server);
  registerGetOrgPermissionsTool(server);
  registerDeleteOrgTool(server);
};
