import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Cron } from "@/utils/types.js";
import { cronContext, cronIdSchema } from "./cron-context";

export const registerGetCronTool = (server: McpServer) =>
  server.registerTool(
    "get_cron",
    {
      title: "Get Cron Job",
      description: "Get a repository cron job by its ID.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        cronId: cronIdSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ repoId, cronId }) => {
      const result = await apiClient.get<Cron>(
        `/repos/${repoId}/cron/${cronId}`
      );

      return toolResponse(
        result,
        (cron) => ({ repoId, cron: cronContext(cron) }),
        `cron job ${cronId} of repository ${repoId}`
      );
    }
  );
