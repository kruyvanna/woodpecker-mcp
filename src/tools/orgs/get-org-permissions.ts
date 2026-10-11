import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { OrgPermission } from "@/utils/types.js";

export const registerGetOrgPermissionsTool = (server: McpServer) =>
  server.registerTool(
    "get_org_permissions",
    {
      title: "Get Organization Permissions",
      description:
        "Get the authenticated user's permissions (member, admin) for an organization.",
      inputSchema: {
        orgId: z.number().int().positive().describe("The organization ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ orgId }) => {
      const result = await apiClient.get<OrgPermission>(
        `/orgs/${orgId}/permissions`
      );

      return toolResponse(
        result,
        (perm) => ({ orgId, member: perm.member, admin: perm.admin }),
        `permissions for organization ${orgId}`
      );
    }
  );
