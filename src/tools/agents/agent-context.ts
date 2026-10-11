import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import type { Agent, Task } from "@/utils/types.js";

// Agents live either server-wide (global) or in an organization
export const agentScopeSchema = {
  scope: z
    .enum(["global", "org"])
    .describe(
      "Where the agent lives: 'global' (server-wide, admin only) or 'org' (requires orgId)"
    ),
  orgId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("The organization ID, required when scope is 'org'"),
};

export type AgentScopeInput = {
  scope: "global" | "org";
  orgId?: number;
};

export const agentsPath = ({
  scope,
  orgId,
}: AgentScopeInput): Result<{ path: string; label: string }, string> => {
  if (scope === "org") {
    return orgId === undefined
      ? Err("orgId is required when scope is 'org'")
      : Ok({ path: `/orgs/${orgId}/agents`, label: `organization ${orgId}` });
  }
  return Ok({ path: "/agents", label: "global scope" });
};

// Never echo the agent token back, except right after creation
export const agentContext = (agent: Agent) => ({
  id: agent.id,
  name: agent.name,
  org_id: agent.org_id,
  owner_id: agent.owner_id,
  platform: agent.platform,
  backend: agent.backend,
  capacity: agent.capacity,
  version: agent.version,
  no_schedule: agent.no_schedule,
  filters: agent.filters,
  custom_labels: agent.custom_labels,
  last_contact: agent.last_contact,
  last_work: agent.last_work,
  created: agent.created,
  updated: agent.updated,
});

export const taskContext = (task: Task) => ({
  id: task.id,
  name: task.name,
  pipeline_id: task.pipeline_id,
  repo_id: task.repo_id,
  agent_id: task.agent_id,
  labels: task.labels,
  dependencies: task.dependencies,
  dep_status: task.dep_status,
});
