import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerRepairAllRepositoriesTool = (server: McpServer) =>
  server.registerTool(
    "repair_all_repositories",
    {
      title: "Repair All Repositories",
      description:
        "Repair the forge webhooks of every active repository on the server. Requires server admin access. Use repair_repository for a single repository.",
      inputSchema: {},
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      const result = await apiClient.post<unknown>("/repos/repair");

      return toolResponse(
        result,
        () => ({ repaired: true }),
        "repairing all repositories"
      );
    }
  );
