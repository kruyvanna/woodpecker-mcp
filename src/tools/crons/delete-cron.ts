import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import { cronIdSchema } from "./cron-context";

export const registerDeleteCronTool = (server: McpServer) =>
  server.registerTool(
    "delete_cron",
    {
      title: "Delete Cron Job",
      description: "Permanently delete a repository cron job.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        cronId: cronIdSchema,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ repoId, cronId }) => {
      const result = await apiClient.delete<unknown>(
        `/repos/${repoId}/cron/${cronId}`
      );

      return toolResponse(
        result,
        () => ({ repoId, cronId, deleted: true }),
        `deleting cron job ${cronId} in repository ${repoId}`
      );
    }
  );
