import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Repo } from "@/utils/types.js";

export const registerChownRepositoryTool = (server: McpServer) =>
  server.registerTool(
    "chown_repository",
    {
      title: "Take Repository Ownership",
      description:
        "Make the authenticated user the owner of a repository in Woodpecker CI. The owner's forge credentials are used for webhooks and cloning, so use this when the previous owner lost access. Requires repository admin access.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ repoId }) => {
      const result = await apiClient.post<Repo>(`/repos/${repoId}/chown`);

      return toolResponse(
        result,
        (repo) => ({
          repoId,
          ownershipTaken: true,
          repository: {
            id: repo.id,
            full_name: repo.full_name,
            owner: repo.owner,
          },
        }),
        `taking ownership of repository ${repoId}`
      );
    }
  );
