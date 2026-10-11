import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerDeleteStepLogsTool = (server: McpServer) =>
  server.registerTool(
    "delete_step_logs",
    {
      title: "Delete Step Logs",
      description:
        "Permanently delete the logs of a single pipeline step (e.g. to remove leaked credentials). Requires push access.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z.number().int().positive().describe("The pipeline number"),
        stepId: z
          .number()
          .int()
          .positive()
          .describe("The step ID (can be found in pipeline details)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ repoId, number, stepId }) => {
      const result = await apiClient.delete<unknown>(
        `/repos/${repoId}/logs/${number}/${stepId}`
      );

      return toolResponse(
        result,
        () => ({ repoId, number, stepId, logsDeleted: true }),
        `deleting logs for step ${stepId} in pipeline ${number} of repository ${repoId}`
      );
    }
  );
