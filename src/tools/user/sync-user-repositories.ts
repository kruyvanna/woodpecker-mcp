import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerSyncUserRepositoriesTool = (server: McpServer) =>
  server.registerTool(
    "sync_user_repositories",
    {
      title: "Sync User Repositories",
      description:
        "Re-sync the authenticated user's repository list and permissions from the forge. Use when a repository is missing or permissions look stale.",
      inputSchema: {},
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      const result = await apiClient.post<unknown>("/user/repos/refresh");

      return toolResponse(
        result,
        () => ({ synced: true }),
        "syncing user repositories"
      );
    }
  );
