import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse, withQuery } from "@/utils/tool.js";

export const registerDeleteRepositoryTool = (server: McpServer) =>
  server.registerTool(
    "delete_repository",
    {
      title: "Delete Repository",
      description:
        "Deactivate a repository in Woodpecker CI (removes the forge webhook). With remove=true the repository is deleted from Woodpecker entirely, including its pipeline history, secrets and settings. Requires repository admin access.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        remove: z
          .boolean()
          .optional()
          .describe(
            "true deletes the repository and all its data from Woodpecker; false/omitted only deactivates it"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    async ({ repoId, remove }) => {
      const params = new URLSearchParams();
      if (remove !== undefined) {
        params.append("remove", remove.toString());
      }

      const result = await apiClient.delete<unknown>(
        withQuery(`/repos/${repoId}`, params)
      );

      return toolResponse(
        result,
        () => ({
          repoId,
          ...(remove ? { removed: true } : { deactivated: true }),
        }),
        `deleting repository ${repoId}`
      );
    }
  );
