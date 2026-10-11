import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDeletePipelineLogsTool } from "./delete-pipeline-logs";
import { registerDeleteStepLogsTool } from "./delete-step-logs";
import { registerGetStepLogsTool } from "./step-logs";

export const registerLogsTools = (server: McpServer) => {
  registerGetStepLogsTool(server);
  registerDeleteStepLogsTool(server);
  registerDeletePipelineLogsTool(server);
};
