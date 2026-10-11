import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetQueueInfoTool } from "./get-queue-info";
import { registerListQueuedPipelinesTool } from "./list-queued-pipelines";
import { registerPauseQueueTool } from "./pause-queue";
import { registerResumeQueueTool } from "./resume-queue";

export const registerQueueTools = (server: McpServer) => {
  registerGetQueueInfoTool(server);
  registerListQueuedPipelinesTool(server);
  registerPauseQueueTool(server);
  registerResumeQueueTool(server);
};
