import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  paginationQuery,
  paginationSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";

export const registerListRepositoryBranchesTool = (server: McpServer) =>
  server.registerTool(
    "list_repository_branches",
    {
      title: "List Repository Branches",
      description:
        "List the branches of a repository as reported by the forge. Useful for choosing a branch for create_pipeline or a cron job.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        ...paginationSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ repoId, page, perPage }) => {
      const result = await apiClient.get<string[] | null>(
        withQuery(`/repos/${repoId}/branches`, paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (branches) => ({
          repoId,
          branches: branches ?? [],
          count: branches?.length ?? 0,
        }),
        `branches of repository ${repoId}`
      );
    }
  );
