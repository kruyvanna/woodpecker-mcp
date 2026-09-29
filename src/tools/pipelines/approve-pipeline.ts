import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import type { Pipeline } from "@/utils/types.js";

const approvedPipelineContext = (repoId: number, pipeline: Pipeline) =>
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

export const registerApprovePipelineTool = (server: McpServer) =>
  server.registerTool(
    "approve_pipeline",
    {
      title: "Approve Pipeline",
      description:
        "Approve and start a pipeline that is blocked waiting for approval (e.g. a pull request from a fork on a repository requiring approval).",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z
          .number()
          .int()
          .positive()
          .describe("The pipeline number to approve"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ repoId, number }) => {
      const result = await apiClient.post<Pipeline>(
        `/repos/${repoId}/pipelines/${number}/approve`
      );

      const text = result
        .map((val) => approvedPipelineContext(repoId, val))
        .mapErr((err) =>
          err.toContext(`approving pipeline ${number} in repository ${repoId}`)
        );

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
