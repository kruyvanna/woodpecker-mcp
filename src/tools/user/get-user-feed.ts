import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse, withQuery } from "@/utils/tool.js";
import type { Feed } from "@/utils/types.js";

export const registerGetUserFeedTool = (server: McpServer) =>
  server.registerTool(
    "get_user_feed",
    {
      title: "Get User Feed",
      description:
        "Get the recent pipeline activity across all repositories the authenticated user has access to.",
      inputSchema: {
        latest: z
          .boolean()
          .optional()
          .describe("Only return the latest pipeline of each repository"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ latest }) => {
      const params = new URLSearchParams();
      if (latest !== undefined) {
        params.append("latest", latest.toString());
      }

      const result = await apiClient.get<Feed[] | null>(
        withQuery("/user/feed", params)
      );

      return toolResponse(
        result,
        (feed) => ({
          feed: (feed ?? []).map((item) => ({
            repoId: item.repo_id,
            repository: item.full_name,
            number: item.number,
            status: item.status,
            event: item.event,
            branch: item.branch,
            ref: item.ref,
            commit: item.commit,
            title: item.title ?? item.message,
            author: item.author,
            created: item.created,
            started: item.started,
            finished: item.finished,
          })),
          count: feed?.length ?? 0,
        }),
        "user pipeline feed"
      );
    }
  );
