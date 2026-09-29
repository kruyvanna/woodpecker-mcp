import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";

const repairedRepositoryContext = (repoId: number) =>
  JSON.stringify({
    repoId,
    repaired: true,
  });

export const registerRepairRepositoryTool = (server: McpServer) =>
  server.registerTool(
    "repair_repository",
    {
      title: "Repair Repository",
      description:
        "Repair a repository's webhook configuration in the forge. Use this when pipelines stop triggering because the webhook is missing or misconfigured.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ repoId }) => {
      const result = await apiClient.post<unknown>(`/repos/${repoId}/repair`);

      const text = result
        .map(() => repairedRepositoryContext(repoId))
        .mapErr((err) => err.toContext(`repairing repository ${repoId}`));

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
