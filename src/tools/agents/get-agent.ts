import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Agent } from "@/utils/types.js";
import { agentContext } from "./agent-context";

export const registerGetAgentTool = (server: McpServer) =>
  server.registerTool(
    "get_agent",
    {
      title: "Get Agent",
      description:
        "Get details of a CI agent by ID (admin only). The agent token is never returned.",
      inputSchema: {
        agentId: z.number().int().positive().describe("The agent ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ agentId }) => {
      const result = await apiClient.get<Agent>(`/agents/${agentId}`);

      return toolResponse(
        result,
        (agent) => ({ agent: agentContext(agent) }),
        `agent ${agentId}`
      );
    }
  );
