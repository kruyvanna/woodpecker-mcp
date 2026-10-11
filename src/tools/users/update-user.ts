import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { errorResponse, toolResponse, withQuery } from "@/utils/tool.js";
import type { User } from "@/utils/types.js";
import { forgeLookupQuery } from "./forge-query";
import { userContext } from "./user-context";

export const registerUpdateUserTool = (server: McpServer) =>
  server.registerTool(
    "update_user",
    {
      title: "Update User",
      description:
        "Update a user (admin only). Only the provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        login: z.string().min(1).describe("The current login name of the user"),
        forgeId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "The forge ID the user belongs to (defaults to the main forge)"
          ),
        newLogin: z.string().min(1).optional().describe("A new login name"),
        email: z.string().email().optional().describe("The new email"),
        avatarUrl: z.string().url().optional().describe("The new avatar URL"),
        admin: z
          .boolean()
          .optional()
          .describe("Grant or revoke server admin rights"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ login, forgeId, newLogin, email, avatarUrl, admin }) => {
      const context = `updating user '${login}'`;
      const endpoint = `/users/${encodeURIComponent(login)}`;

      // The server replaces login, email, avatar and admin wholesale, so merge onto the current user
      const current = await apiClient.get<User>(
        withQuery(endpoint, forgeLookupQuery(forgeId))
      );
      if (current.err) {
        return errorResponse(current.val, context);
      }
      const user = current.val;

      const result = await apiClient.patch<User>(endpoint, {
        login: newLogin ?? user.login,
        email: email ?? user.email,
        avatar_url: avatarUrl ?? user.avatar_url,
        admin: admin ?? user.admin ?? false,
        forge_id: user.forge_id ?? forgeId,
        forge_remote_id: user.forge_remote_id,
      });

      return toolResponse(
        result,
        (updated) => ({ updated: true, user: userContext(updated) }),
        context
      );
    }
  );
