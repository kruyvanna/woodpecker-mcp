import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Pipeline } from "@/utils/types.js";
import { cronIdSchema } from "./cron-context";

export const registerRunCronTool = (server: McpServer) =>
  server.registerTool(
    "run_cron",
    {
      title: "Run Cron Job",
      description:
        "Trigger a cron job immediately, outside of its schedule. Returns the created pipeline.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        cronId: cronIdSchema,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ repoId, cronId }) => {
      const result = await apiClient.post<Pipeline>(
        `/repos/${repoId}/cron/${cronId}`
      );

      return toolResponse(
        result,
        (pipeline) => ({
          repoId,
          cronId,
          pipeline: {
            id: pipeline.id,
            number: pipeline.number,
            status: pipeline.status,
            event: pipeline.event,
            branch: pipeline.branch,
            commit: pipeline.commit,
            message: pipeline.message,
            author: pipeline.author,
            created: pipeline.created_at,
          },
        }),
        `running cron job ${cronId} in repository ${repoId}`
      );
    }
  );
