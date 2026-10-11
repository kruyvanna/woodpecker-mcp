import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { invalidInputResponse, toolResponse } from "@/utils/tool.js";
import type { Agent } from "@/utils/types.js";
import { agentContext, agentScopeSchema, agentsPath } from "./agent-context";

export const registerCreateAgentTool = (server: McpServer) =>
  server.registerTool(
    "create_agent",
    {
      title: "Create Agent",
      description:
        "Register a new CI agent server-wide (global, admin only) or for an organization. Returns the agent token needed to connect the agent (WOODPECKER_AGENT_SECRET).",
      inputSchema: {
        ...agentScopeSchema,
        name: z.string().min(1).describe("The agent name"),
        noSchedule: z
          .boolean()
          .optional()
          .describe("Prevent new tasks from being scheduled on this agent"),
        filters: z
          .record(z.string())
          .optional()
          .describe(
            "Server-enforced label filters restricting which tasks the agent picks up"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ scope, orgId, name, noSchedule, filters }) => {
      const base = agentsPath({ scope, orgId });
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.post<Agent>(path, {
        name,
        no_schedule: noSchedule ?? false,
        filters: filters ?? {},
      });

      return toolResponse(
        result,
        (agent) => ({
          scope,
          created: true,
          agent: agentContext(agent),
          token: agent.token,
          note: "This token is the agent's registration secret; store it securely, it is not returned again by this server.",
        }),
        `creating agent '${name}' in ${label}`
      );
    }
  );
