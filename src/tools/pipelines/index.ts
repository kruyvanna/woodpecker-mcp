import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerApprovePipelineTool } from "./approve-pipeline";
import { registerCancelPipelineTool } from "./cancel-pipeline";
import { registerCreatePipelineTool } from "./create-pipeline";
import { registerDeclinePipelineTool } from "./decline-pipeline";
import { registerGetPipelineTool } from "./get-pipeline";
import { registerGetPipelineConfigTool } from "./get-pipeline-config";
import { registerListPipelinesTool } from "./list-pipelines";
import { registerRestartPipelineTool } from "./restart-pipeline";

export const registerPipelinesTools = (server: McpServer) => {
  registerListPipelinesTool(server);
  registerGetPipelineTool(server);
  registerGetPipelineConfigTool(server);
  registerCreatePipelineTool(server);
  registerRestartPipelineTool(server);
  registerCancelPipelineTool(server);
  registerApprovePipelineTool(server);
  registerDeclinePipelineTool(server);
};
