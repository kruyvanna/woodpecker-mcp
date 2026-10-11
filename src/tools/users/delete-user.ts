import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse, withQuery } from "@/utils/tool.js";
import { forgeLookupQuery, forgeLookupSchema } from "./forge-query";

export const registerDeleteUserTool = (server: McpServer) =>
  server.registerTool(
    "delete_user",
    {
      title: "Delete User",
      description:
        "Permanently delete a user from the Woodpecker server (admin only).",
      inputSchema: {
        login: z
          .string()
          .min(1)
          .describe("The login name of the user to delete"),
        ...forgeLookupSchema,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ login, forgeId, forgeRemoteId }) => {
      const result = await apiClient.delete<unknown>(
        withQuery(
          `/users/${encodeURIComponent(login)}`,
          forgeLookupQuery(forgeId, forgeRemoteId)
        )
      );

      return toolResponse(
        result,
        () => ({ login, deleted: true }),
        `deleting user '${login}'`
      );
    }
  );
