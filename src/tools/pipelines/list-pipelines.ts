import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { WEBHOOK_EVENTS } from "@/utils/tool.js";
import type { Pipeline, StatusValue } from "@/utils/types.js";

const STATUS_VALUES = [
  "skipped",
  "pending",
  "running",
  "success",
  "failure",
  "killed",
  "canceled",
  "error",
  "blocked",
  "declined",
  "created",
] as const satisfies readonly StatusValue[];

const pipelinesContext = (repoId: number, pipelines: Pipeline[]) =>
  JSON.stringify({
    repoId,
    pipelines: pipelines.map((pipeline) => ({
      id: pipeline.id,
      number: pipeline.number,
      status: pipeline.status,
      event: pipeline.event,
      branch: pipeline.branch,
      commit: pipeline.commit,
      message: pipeline.message,
      author: pipeline.author,
      started: pipeline.started_at,
      finished: pipeline.finished_at,
      created: pipeline.created_at,
      updated: pipeline.updated_at,
    })),
    count: pipelines.length,
  });

export const registerListPipelinesTool = (server: McpServer) =>
  server.registerTool(
    "list_pipelines",
    {
      title: "List Pipelines",
      description: `List pipelines for a repository with optional filtering. Returns pipeline metadata including status, commit info, and timing.
If required information is not provided, use the git command or any available tool to get more context about the current commit, the repository, or the author of the commit.`,
      inputSchema: {
        repoId: z.number().int().positive().describe("Numeric repository ID"),
        page: z
          .number()
          .int()
          .positive()
          .optional()
          .default(1)
          .describe("Page number for pagination"),
        perPage: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .default(50)
          .describe("Number of pipelines per page"),
        before: z
          .string()
          .optional()
          .describe(
            "Only return pipelines before this RFC3339 date (e.g., '2023-12-01T10:00:00Z')"
          ),
        after: z
          .string()
          .optional()
          .describe(
            "Only return pipelines after this RFC3339 date (e.g., '2023-12-01T10:00:00Z')"
          ),
        branch: z
          .string()
          .optional()
          .describe("Only return pipelines for this branch"),
        event: z
          .array(z.enum(WEBHOOK_EVENTS))
          .min(1)
          .optional()
          .describe("Only return pipelines triggered by one of these events"),
        ref: z
          .string()
          .optional()
          .describe(
            "Only return pipelines whose git ref contains this string (e.g. 'refs/tags/v1')"
          ),
        status: z
          .enum(STATUS_VALUES)
          .optional()
          .describe("Only return pipelines with this status"),
      },
    },
    async ({
      repoId,
      page,
      perPage,
      before,
      after,
      branch,
      event,
      ref,
      status,
    }) => {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
      });

      if (before) {
        params.append("before", before);
      }
      if (after) {
        params.append("after", after);
      }
      if (branch) {
        params.append("branch", branch);
      }
      if (event) {
        params.append("event", event.join(","));
      }
      if (ref) {
        params.append("ref", ref);
      }
      if (status) {
        params.append("status", status);
      }

      const result = await apiClient.get<Pipeline[]>(
        `/repos/${repoId}/pipelines?${params.toString()}`
      );

      const text = result
        .map((val) =>
          val.length === 0
            ? pipelinesContext(repoId, [])
            : pipelinesContext(repoId, val)
        )
        .mapErr((err) => err.toContext(`pipelines for repository ${repoId}`));

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
