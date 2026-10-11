import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerResumeQueueTool = (server: McpServer) =>
  server.registerTool(
    "resume_queue",
    {
      title: "Resume Queue",
      description:
        "Resume a paused pipeline queue (admin only) so agents pick up tasks again.",
      inputSchema: {},
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      const result = await apiClient.post<unknown>("/queue/resume");

      return toolResponse(
        result,
        () => ({ paused: false }),
        "resuming the queue"
      );
    }
  );
