import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  paginationQuery,
  paginationSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { PullRequest } from "@/utils/types.js";

export const registerListRepositoryPullRequestsTool = (server: McpServer) =>
  server.registerTool(
    "list_repository_pull_requests",
    {
      title: "List Repository Pull Requests",
      description:
        "List the open pull requests of a repository as reported by the forge.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        ...paginationSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ repoId, page, perPage }) => {
      const result = await apiClient.get<PullRequest[] | null>(
        withQuery(
          `/repos/${repoId}/pull_requests`,
          paginationQuery(page, perPage)
        )
      );

      return toolResponse(
        result,
        (pullRequests) => ({
          repoId,
          pullRequests: (pullRequests ?? []).map((pr) => ({
            index: pr.index,
            title: pr.title,
          })),
          count: pullRequests?.length ?? 0,
        }),
        `pull requests of repository ${repoId}`
      );
    }
  );
