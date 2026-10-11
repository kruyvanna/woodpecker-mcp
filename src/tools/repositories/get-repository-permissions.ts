import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { RepoPermission } from "@/utils/types.js";

export const registerGetRepositoryPermissionsTool = (server: McpServer) =>
  server.registerTool(
    "get_repository_permissions",
    {
      title: "Get Repository Permissions",
      description:
        "Check the authenticated user's access (pull, push, admin) to a repository. Useful before attempting write operations.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ repoId }) => {
      const result = await apiClient.get<RepoPermission>(
        `/repos/${repoId}/permissions`
      );

      return toolResponse(
        result,
        (perm) => ({
          repoId,
          permissions: {
            pull: perm.pull,
            push: perm.push,
            admin: perm.admin,
            synced: perm.synced,
          },
        }),
        `permissions for repository ${repoId}`
      );
    }
  );
