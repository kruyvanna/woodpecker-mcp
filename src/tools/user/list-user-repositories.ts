import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse, withQuery } from "@/utils/tool.js";
import type { RepoWithLastPipeline } from "@/utils/types.js";

export const registerListUserRepositoriesTool = (server: McpServer) =>
  server.registerTool(
    "list_user_repositories",
    {
      title: "List User Repositories",
      description:
        "List the repositories the authenticated user has access to, with each repository's last pipeline. Works for non-admin users (unlike list_repositories).",
      inputSchema: {
        all: z
          .boolean()
          .optional()
          .describe(
            "Include inactive repositories (not yet enabled in Woodpecker)"
          ),
        name: z
          .string()
          .optional()
          .describe("Only return repositories whose name contains this text"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ all, name }) => {
      const params = new URLSearchParams();
      if (all !== undefined) {
        params.append("all", all.toString());
      }
      if (name) {
        params.append("name", name);
      }

      const result = await apiClient.get<RepoWithLastPipeline[] | null>(
        withQuery("/user/repos", params)
      );

      return toolResponse(
        result,
        (repos) => ({
          repositories: (repos ?? []).map((repo) => ({
            id: repo.id,
            forge_remote_id: repo.forge_remote_id,
            full_name: repo.full_name,
            default_branch: repo.default_branch,
            private: repo.private,
            active: repo.active,
            last_pipeline: repo.last_pipeline && {
              number: repo.last_pipeline.number,
              status: repo.last_pipeline.status,
              branch: repo.last_pipeline.branch,
              event: repo.last_pipeline.event,
            },
          })),
          count: repos?.length ?? 0,
        }),
        "user repositories"
      );
    }
  );
