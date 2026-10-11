import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse, withQuery } from "@/utils/tool.js";
import type { User } from "@/utils/types.js";
import { forgeLookupQuery, forgeLookupSchema } from "./forge-query";
import { userContext } from "./user-context";

export const registerGetUserTool = (server: McpServer) =>
  server.registerTool(
    "get_user",
    {
      title: "Get User",
      description: "Get a user by login name (admin only).",
      inputSchema: {
        login: z.string().min(1).describe("The user's login name"),
        ...forgeLookupSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ login, forgeId, forgeRemoteId }) => {
      const result = await apiClient.get<User>(
        withQuery(
          `/users/${encodeURIComponent(login)}`,
          forgeLookupQuery(forgeId, forgeRemoteId)
        )
      );

      return toolResponse(
        result,
        (user) => ({ user: userContext(user) }),
        `user '${login}'`
      );
    }
  );
