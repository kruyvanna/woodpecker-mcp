import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import type { Pipeline } from "@/utils/types.js";

const declinedPipelineContext = (repoId: number, pipeline: Pipeline) =>
  JSON.stringify({
    repoId,
    pipeline: {
      id: pipeline.id,
      number: pipeline.number,
      status: pipeline.status,
      event: pipeline.event,
      branch: pipeline.branch,
      commit: pipeline.commit,
      message: pipeline.message,
      author: pipeline.author,
    },
  });

export const registerDeclinePipelineTool = (server: McpServer) =>
  server.registerTool(
    "decline_pipeline",
    {
      title: "Decline Pipeline",
      description:
        "Decline a pipeline that is blocked waiting for approval, preventing it from running.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z
          .number()
          .int()
          .positive()
          .describe("The pipeline number to decline"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    async ({ repoId, number }) => {
      const result = await apiClient.post<Pipeline>(
        `/repos/${repoId}/pipelines/${number}/decline`
      );

      const text = result
        .map((val) => declinedPipelineContext(repoId, val))
        .mapErr((err) =>
          err.toContext(`declining pipeline ${number} in repository ${repoId}`)
        );

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
