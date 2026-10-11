import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

const REPO_NAME_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

export const registerMoveRepositoryTool = (server: McpServer) =>
  server.registerTool(
    "move_repository",
    {
      title: "Move Repository",
      description:
        "Move a repository to a new owner/namespace in Woodpecker CI, e.g. after it was transferred on the forge. Requires repository admin access.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        to: z
          .string()
          .regex(REPO_NAME_REGEX, "Must be in 'owner/repo' format")
          .describe(
            "The new full name of the repository (e.g. 'new-owner/repo')"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ repoId, to }) => {
      const params = new URLSearchParams({ to });
      const result = await apiClient.post<unknown>(
        `/repos/${repoId}/move?${params.toString()}`
      );

      return toolResponse(
        result,
        () => ({ repoId, movedTo: to }),
        `moving repository ${repoId} to ${to}`
      );
    }
  );
