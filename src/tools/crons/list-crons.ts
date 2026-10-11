import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  paginationQuery,
  paginationSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { Cron } from "@/utils/types.js";
import { cronContext } from "./cron-context";

export const registerListCronsTool = (server: McpServer) =>
  server.registerTool(
    "list_crons",
    {
      title: "List Cron Jobs",
      description:
        "List the scheduled cron jobs of a repository, including schedule, branch and next execution time.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        ...paginationSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ repoId, page, perPage }) => {
      const result = await apiClient.get<Cron[] | null>(
        withQuery(`/repos/${repoId}/cron`, paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (crons) => ({
          repoId,
          crons: (crons ?? []).map(cronContext),
          count: crons?.length ?? 0,
        }),
        `cron jobs of repository ${repoId}`
      );
    }
  );
