import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerDeletePipelineLogsTool = (server: McpServer) =>
  server.registerTool(
    "delete_pipeline_logs",
    {
      title: "Delete Pipeline Logs",
      description:
        "Permanently delete the logs of every step in a pipeline (e.g. to remove leaked credentials). The pipeline itself is kept. Requires push access.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z.number().int().positive().describe("The pipeline number"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ repoId, number }) => {
      const result = await apiClient.delete<unknown>(
        `/repos/${repoId}/logs/${number}`
      );

      return toolResponse(
        result,
        () => ({ repoId, number, logsDeleted: true }),
        `deleting logs of pipeline ${number} in repository ${repoId}`
      );
    }
  );
