import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import {
  paginationQuery,
  paginationSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { Forge } from "@/utils/types.js";
import { forgeContext } from "./forge-context";

export const registerListForgesTool = (server: McpServer) =>
  server.registerTool(
    "list_forges",
    {
      title: "List Forges",
      description:
        "List the forges (GitHub, GitLab, Gitea, ...) configured on the Woodpecker server.",
      inputSchema: {
        ...paginationSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ page, perPage }) => {
      const result = await apiClient.get<Forge[] | null>(
        withQuery("/forges", paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (forges) => ({
          forges: (forges ?? []).map(forgeContext),
          count: forges?.length ?? 0,
        }),
        "forges list"
      );
    }
  );
