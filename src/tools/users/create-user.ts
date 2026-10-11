import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { definedOnly, toolResponse } from "@/utils/tool.js";
import type { User } from "@/utils/types.js";
import { userContext } from "./user-context";

export const registerCreateUserTool = (server: McpServer) =>
  server.registerTool(
    "create_user",
    {
      title: "Create User",
      description:
        "Create a Woodpecker user (admin only). The user can then log in through the forge.",
      inputSchema: {
        login: z.string().min(1).describe("The user's login name at the forge"),
        email: z.string().email().optional().describe("The user's email"),
        avatarUrl: z
          .string()
          .url()
          .optional()
          .describe("The user's avatar URL"),
        forgeId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "The forge ID the user belongs to (defaults to the main forge)"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ login, email, avatarUrl, forgeId }) => {
      const result = await apiClient.post<User>(
        "/users",
        definedOnly({
          login,
          email,
          avatar_url: avatarUrl,
          forge_id: forgeId,
        })
      );

      return toolResponse(
        result,
        (user) => ({ created: true, user: userContext(user) }),
        `creating user '${login}'`
      );
    }
  );
