import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";

const canceledPipelineContext = (repoId: number, number: number) =>
  JSON.stringify({
    repoId,
    number,
    canceled: true,
  });

export const registerCancelPipelineTool = (server: McpServer) =>
  server.registerTool(
    "cancel_pipeline",
    {
      title: "Cancel Pipeline",
      description:
        "Cancel a running or pending pipeline. Useful for stopping a stuck or no-longer-needed pipeline.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z
          .number()
          .int()
          .positive()
          .describe("The pipeline number to cancel"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ repoId, number }) => {
      const result = await apiClient.post<unknown>(
        `/repos/${repoId}/pipelines/${number}/cancel`
      );

      const text = result
        .map(() => canceledPipelineContext(repoId, number))
        .mapErr((err) =>
          err.toContext(`canceling pipeline ${number} in repository ${repoId}`)
        );

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
