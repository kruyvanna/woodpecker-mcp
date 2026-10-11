import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { User } from "@/utils/types.js";

export const registerGetCurrentUserTool = (server: McpServer) =>
  server.registerTool(
    "get_current_user",
    {
      title: "Get Current User",
      description:
        "Get the user this server is authenticated as, including whether they are a server admin.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await apiClient.get<User>("/user");

      return toolResponse(
        result,
        (user) => ({
          user: {
            id: user.id,
            login: user.login,
            email: user.email,
            avatar_url: user.avatar_url,
            admin: user.admin ?? false,
            forge_id: user.forge_id,
            org_id: user.org_id,
          },
        }),
        "current user"
      );
    }
  );
