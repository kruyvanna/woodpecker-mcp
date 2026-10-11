import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerDeleteOrgTool = (server: McpServer) =>
  server.registerTool(
    "delete_org",
    {
      title: "Delete Organization",
      description:
        "Permanently delete an organization and its org-level secrets, registries and agents from Woodpecker (admin only).",
      inputSchema: {
        orgId: z
          .number()
          .int()
          .positive()
          .describe("The ID of the organization to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ orgId }) => {
      const result = await apiClient.delete<unknown>(`/orgs/${orgId}`);

      return toolResponse(
        result,
        () => ({ orgId, deleted: true }),
        `deleting organization ${orgId}`
      );
    }
  );
