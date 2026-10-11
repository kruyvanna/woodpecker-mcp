import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Task } from "@/utils/types.js";
import { taskContext } from "./agent-context";

export const registerListAgentTasksTool = (server: McpServer) =>
  server.registerTool(
    "list_agent_tasks",
    {
      title: "List Agent Tasks",
      description:
        "List the tasks (workflows) an agent is currently running (admin only). Useful to see what is occupying an agent.",
      inputSchema: {
        agentId: z.number().int().positive().describe("The agent ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ agentId }) => {
      const result = await apiClient.get<Task[] | null>(
        `/agents/${agentId}/tasks`
      );

      return toolResponse(
        result,
        (tasks) => ({
          agentId,
          tasks: (tasks ?? []).map(taskContext),
          count: tasks?.length ?? 0,
        }),
        `tasks of agent ${agentId}`
      );
    }
  );
