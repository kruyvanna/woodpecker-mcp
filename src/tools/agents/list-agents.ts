import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import {
  invalidInputResponse,
  paginationQuery,
  paginationSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { Agent } from "@/utils/types.js";
import { agentContext, agentScopeSchema, agentsPath } from "./agent-context";

export const registerListAgentsTool = (server: McpServer) =>
  server.registerTool(
    "list_agents",
    {
      title: "List Agents",
      description:
        "List CI agents registered server-wide (global, admin only) or in an organization, including platform, backend, capacity and last contact.",
      inputSchema: {
        ...agentScopeSchema,
        ...paginationSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ scope, orgId, page, perPage }) => {
      const base = agentsPath({ scope, orgId });
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.get<Agent[] | null>(
        withQuery(path, paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (agents) => ({
          scope,
          agents: (agents ?? []).map(agentContext),
          count: agents?.length ?? 0,
        }),
        `agents of ${label}`
      );
    }
  );
