import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerDeletePipelineTool = (server: McpServer) =>
  server.registerTool(
    "delete_pipeline",
    {
      title: "Delete Pipeline",
      description:
        "Permanently delete a finished pipeline, including its workflows, steps and logs. Running pipelines must be canceled first. Requires repository admin access.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z
          .number()
          .int()
          .positive()
          .describe("The pipeline number to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ repoId, number }) => {
      const result = await apiClient.delete<unknown>(
        `/repos/${repoId}/pipelines/${number}`
      );

      return toolResponse(
        result,
        () => ({ repoId, number, deleted: true }),
        `deleting pipeline ${number} in repository ${repoId}`
      );
    }
  );
