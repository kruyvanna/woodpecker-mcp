import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { invalidInputResponse, toolResponse } from "@/utils/tool.js";
import { agentScopeSchema, agentsPath } from "./agent-context";

export const registerDeleteAgentTool = (server: McpServer) =>
  server.registerTool(
    "delete_agent",
    {
      title: "Delete Agent",
      description:
        "Permanently delete a CI agent. The agent can no longer connect with its token.",
      inputSchema: {
        ...agentScopeSchema,
        agentId: z.number().int().positive().describe("The agent ID"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ scope, orgId, agentId }) => {
      const base = agentsPath({ scope, orgId });
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.delete<unknown>(`${path}/${agentId}`);

      return toolResponse(
        result,
        () => ({ scope, agentId, deleted: true }),
        `deleting agent ${agentId} in ${label}`
      );
    }
  );
