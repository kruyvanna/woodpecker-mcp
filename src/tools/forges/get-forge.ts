import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Forge } from "@/utils/types.js";
import { forgeContext } from "./forge-context";

export const registerGetForgeTool = (server: McpServer) =>
  server.registerTool(
    "get_forge",
    {
      title: "Get Forge",
      description: "Get a forge's configuration by ID.",
      inputSchema: {
        forgeId: z.number().int().positive().describe("The forge ID"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ forgeId }) => {
      const result = await apiClient.get<Forge>(`/forges/${forgeId}`);

      return toolResponse(
        result,
        (forge) => ({ forge: forgeContext(forge) }),
        `forge ${forgeId}`
      );
    }
  );
