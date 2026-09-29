import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import type { Pipeline, PipelineOptions } from "@/utils/types.js";

const createdPipelineContext = (repoId: number, pipeline: Pipeline) =>
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
      created: pipeline.created_at,
    },
  });

export const registerCreatePipelineTool = (server: McpServer) =>
  server.registerTool(
    "create_pipeline",
    {
      title: "Create Pipeline",
      description:
        "Trigger a new manual pipeline run for a repository on a given branch. Use this to (re)start CI for a branch without pushing a new commit.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        branch: z.string().min(1).describe("The branch to run the pipeline on"),
        message: z
          .string()
          .optional()
          .describe("Optional message describing why the pipeline was run"),
        variables: z
          .record(z.string())
          .optional()
          .describe(
            "Optional key/value variables exposed to the pipeline as environment variables"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ repoId, branch, message, variables }) => {
      const options: PipelineOptions = {
        branch,
        ...(message ? { message } : {}),
        ...(variables ? { variables } : {}),
      };

      const result = await apiClient.post<Pipeline>(
        `/repos/${repoId}/pipelines`,
        options
      );

      const text = result
        .map((val) => createdPipelineContext(repoId, val))
        .mapErr((err) =>
          err.toContext(`creating a pipeline for repository ${repoId}`)
        );

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
