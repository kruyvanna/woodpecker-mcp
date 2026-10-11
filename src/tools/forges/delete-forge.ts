import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerDeleteForgeTool = (server: McpServer) =>
  server.registerTool(
    "delete_forge",
    {
      title: "Delete Forge",
      description:
        "Permanently delete a forge from the Woodpecker server (admin only). Users and repositories of this forge lose access.",
      inputSchema: {
        forgeId: z.number().int().positive().describe("The forge ID"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ forgeId }) => {
      const result = await apiClient.delete<unknown>(`/forges/${forgeId}`);

      return toolResponse(
        result,
        () => ({ forgeId, deleted: true }),
        `deleting forge ${forgeId}`
      );
    }
  );
