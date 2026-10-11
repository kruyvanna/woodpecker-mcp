import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerPauseQueueTool = (server: McpServer) =>
  server.registerTool(
    "pause_queue",
    {
      title: "Pause Queue",
      description:
        "Pause the pipeline queue (admin only). Agents stop picking up new tasks until the queue is resumed; running tasks continue.",
      inputSchema: {},
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      const result = await apiClient.post<unknown>("/queue/pause");

      return toolResponse(
        result,
        () => ({ paused: true }),
        "pausing the queue"
      );
    }
  );
