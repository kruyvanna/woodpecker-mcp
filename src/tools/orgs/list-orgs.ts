import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import {
  paginationQuery,
  paginationSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { Org } from "@/utils/types.js";
import { orgContext } from "./org-context";

export const registerListOrgsTool = (server: McpServer) =>
  server.registerTool(
    "list_orgs",
    {
      title: "List Organizations",
      description:
        "List all organizations (including personal user namespaces) known to the Woodpecker server (admin only).",
      inputSchema: { ...paginationSchema },
      annotations: { readOnlyHint: true },
    },
    async ({ page, perPage }) => {
      const result = await apiClient.get<Org[] | null>(
        withQuery("/orgs", paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (orgs) => ({
          orgs: (orgs ?? []).map(orgContext),
          count: orgs?.length ?? 0,
        }),
        "organizations list"
      );
    }
  );
