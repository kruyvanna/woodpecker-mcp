import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import {
  paginationQuery,
  paginationSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { User } from "@/utils/types.js";
import { userContext } from "./user-context";

export const registerListUsersTool = (server: McpServer) =>
  server.registerTool(
    "list_users",
    {
      title: "List Users",
      description:
        "List all users registered on the Woodpecker server (admin only).",
      inputSchema: { ...paginationSchema },
      annotations: { readOnlyHint: true },
    },
    async ({ page, perPage }) => {
      const result = await apiClient.get<User[] | null>(
        withQuery("/users", paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (users) => ({
          users: (users ?? []).map(userContext),
          count: users?.length ?? 0,
        }),
        "users list"
      );
    }
  );
