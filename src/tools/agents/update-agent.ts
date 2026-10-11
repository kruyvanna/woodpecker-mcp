import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { ApiError } from "@/utils/error.js";
import {
  errorResponse,
  invalidInputResponse,
  paginationQuery,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { Agent } from "@/utils/types.js";
import {
  type AgentScopeInput,
  agentContext,
  agentScopeSchema,
  agentsPath,
} from "./agent-context";

const ORG_AGENTS_PAGE_SIZE = 100;

const findOrgAgent = async (
  path: string,
  agentId: number
): Promise<Result<Agent, ApiError>> => {
  for (let page = 1; ; page++) {
    const result = await apiClient.get<Agent[] | null>(
      withQuery(path, paginationQuery(page, ORG_AGENTS_PAGE_SIZE))
    );
    if (result.err) {
      return result;
    }

    const agents = result.val ?? [];
    const agent = agents.find((candidate) => candidate.id === agentId);
    if (agent) {
      return Ok(agent);
    }
    if (agents.length < ORG_AGENTS_PAGE_SIZE) {
      return Err(new ApiError(404, `Agent ${agentId} not found`));
    }
  }
};

// The server replaces name, filters and no_schedule wholesale, so merge onto the current agent
const fetchCurrentAgent = (
  { scope }: AgentScopeInput,
  path: string,
  agentId: number
) =>
  scope === "org"
    ? findOrgAgent(path, agentId)
    : apiClient.get<Agent>(`/agents/${agentId}`);

export const registerUpdateAgentTool = (server: McpServer) =>
  server.registerTool(
    "update_agent",
    {
      title: "Update Agent",
      description:
        "Update a CI agent's name, scheduling or filters. Only the provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        ...agentScopeSchema,
        agentId: z.number().int().positive().describe("The agent ID"),
        name: z.string().min(1).optional().describe("The new agent name"),
        noSchedule: z
          .boolean()
          .optional()
          .describe("Prevent new tasks from being scheduled on this agent"),
        filters: z
          .record(z.string())
          .optional()
          .describe(
            "Server-enforced label filters (replaces the existing filters)"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ scope, orgId, agentId, name, noSchedule, filters }) => {
      const base = agentsPath({ scope, orgId });
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;
      const context = `updating agent ${agentId} in ${label}`;

      const current = await fetchCurrentAgent({ scope, orgId }, path, agentId);
      if (current.err) {
        return errorResponse(current.val, context);
      }

      const result = await apiClient.patch<Agent>(`${path}/${agentId}`, {
        name: name ?? current.val.name,
        no_schedule: noSchedule ?? current.val.no_schedule,
        filters: filters ?? current.val.filters ?? {},
      });

      return toolResponse(
        result,
        (agent) => ({ scope, updated: true, agent: agentContext(agent) }),
        context
      );
    }
  );
