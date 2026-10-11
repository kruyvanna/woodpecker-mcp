import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Org } from "@/utils/types.js";
import { orgContext } from "./org-context";

export const registerLookupOrgTool = (server: McpServer) =>
  server.registerTool(
    "lookup_org",
    {
      title: "Lookup Organization",
      description:
        "Find an organization by its full name (e.g. 'my-org' or a nested group like 'group/subgroup'). Returns the organization ID needed by org-scoped tools.",
      inputSchema: {
        fullName: z
          .string()
          .min(1)
          .describe("The organization's full name / slug"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ fullName }) => {
      // Keep slashes of nested groups, encode each segment
      const path = fullName
        .split("/")
        .filter(Boolean)
        .map(encodeURIComponent)
        .join("/");

      const result = await apiClient.get<Org>(`/orgs/lookup/${path}`);

      return toolResponse(
        result,
        (org) => ({ fullName, org: orgContext(org) }),
        `organization lookup for ${fullName}`
      );
    }
  );
