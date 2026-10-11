import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Org } from "@/utils/types.js";
import { orgContext } from "./org-context";

export const registerGetOrgTool = (server: McpServer) =>
  server.registerTool(
    "get_org",
    {
      title: "Get Organization",
      description: "Get an organization by its ID.",
      inputSchema: {
        orgId: z.number().int().positive().describe("The organization ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ orgId }) => {
      const result = await apiClient.get<Org>(`/orgs/${orgId}`);

      return toolResponse(
        result,
        (org) => ({ org: orgContext(org) }),
        `organization ${orgId}`
      );
    }
  );
