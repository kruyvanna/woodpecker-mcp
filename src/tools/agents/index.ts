import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateAgentTool } from "./create-agent";
import { registerDeleteAgentTool } from "./delete-agent";
import { registerGetAgentTool } from "./get-agent";
import { registerListAgentTasksTool } from "./list-agent-tasks";
import { registerListAgentsTool } from "./list-agents";
import { registerUpdateAgentTool } from "./update-agent";

export const registerAgentsTools = (server: McpServer) => {
  registerListAgentsTool(server);
  registerGetAgentTool(server);
  registerListAgentTasksTool(server);
  registerCreateAgentTool(server);
  registerUpdateAgentTool(server);
  registerDeleteAgentTool(server);
};
