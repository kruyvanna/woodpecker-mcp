import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import type { Repo } from "@/utils/types.js";

const activatedRepositoryContext = (forgeRemoteId: string, repo: Repo) =>
  JSON.stringify({
    forgeRemoteId,
    repository: {
      id: repo.id,
      forge_remote_id: repo.forge_remote_id,
      name: repo.name,
      owner: repo.owner,
      full_name: repo.full_name,
      active: repo.active,
    },
  });

export const registerActivateRepositoryTool = (server: McpServer) =>
  server.registerTool(
    "activate_repository",
    {
      title: "Activate Repository",
      description: `Activate a repository in Woodpecker CI, enabling pipelines for it. Requires the repository's forge_remote_id.
Use search_repository or list_repositories first to find the forge_remote_id of the repository to activate.`,
      inputSchema: {
        forgeRemoteId: z
          .string()
          .min(1)
          .describe("The repository's ID on the forge (e.g. GitHub, Gitea)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ forgeRemoteId }) => {
      const result = await apiClient.post<Repo>(
        `/repos?forge_remote_id=${encodeURIComponent(forgeRemoteId)}`
      );

      const text = result
        .map((val) => activatedRepositoryContext(forgeRemoteId, val))
        .mapErr((err) =>
          err.toContext(
            `activating repository with forge_remote_id ${forgeRemoteId}`
          )
        );

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
