import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import type { Pipeline } from "@/utils/types.js";

const restartedPipelineContext = (
  repoId: number,
  originalNumber: number,
  pipeline: Pipeline
) =>
  JSON.stringify({
    repoId,
    restartedFrom: originalNumber,
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

export const registerRestartPipelineTool = (server: McpServer) =>
  server.registerTool(
    "restart_pipeline",
    {
      title: "Restart Pipeline",
      description:
        "Restart a previously run pipeline, optionally overriding it into a deploy event. Useful for retrying a failed pipeline.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z
          .number()
          .int()
          .positive()
          .describe("The pipeline number to restart"),
        event: z
          .literal("deploy")
          .optional()
          .describe(
            "Override the restarted pipeline's event to 'deploy' (requires the repository to allow deployments)"
          ),
        deployTo: z
          .string()
          .optional()
          .describe("The deploy target, only used when event is 'deploy'"),
        deployTask: z
          .string()
          .optional()
          .describe("Override the deploy task name"),
        environment: z
          .record(z.string())
          .optional()
          .describe(
            "Additional key/value variables injected into the restarted pipeline as environment variables"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ repoId, number, event, deployTo, deployTask, environment }) => {
      const params = new URLSearchParams();

      if (event) {
        params.append("event", event);
      }
      if (deployTo) {
        params.append("deploy_to", deployTo);
      }
      if (deployTask) {
        params.append("deploy_task", deployTask);
      }
      for (const [key, value] of Object.entries(environment ?? {})) {
        params.append(key, value);
      }

      const query = params.toString();
      const endpoint = `/repos/${repoId}/pipelines/${number}${query ? `?${query}` : ""}`;

      const result = await apiClient.post<Pipeline>(endpoint);

      const text = result
        .map((val) => restartedPipelineContext(repoId, number, val))
        .mapErr((err) =>
          err.toContext(`restarting pipeline ${number} in repository ${repoId}`)
        );

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
