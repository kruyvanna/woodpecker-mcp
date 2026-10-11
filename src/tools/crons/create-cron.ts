import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { definedOnly, toolResponse } from "@/utils/tool.js";
import type { Cron } from "@/utils/types.js";
import { cronContext, SCHEDULE_DESCRIPTION } from "./cron-context";

export const registerCreateCronTool = (server: McpServer) =>
  server.registerTool(
    "create_cron",
    {
      title: "Create Cron Job",
      description: `Create a cron job that periodically triggers a pipeline (event 'cron') for a repository. ${SCHEDULE_DESCRIPTION}.`,
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        name: z.string().min(1).describe("The cron job name"),
        schedule: z.string().min(1).describe(SCHEDULE_DESCRIPTION),
        branch: z
          .string()
          .optional()
          .describe(
            "Branch to run the pipeline on (defaults to the repository's default branch)"
          ),
        timezone: z
          .string()
          .optional()
          .describe(
            "IANA timezone for the schedule (e.g. 'Europe/Berlin'), defaults to UTC"
          ),
        enabled: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether the cron job is active"),
        variables: z
          .record(z.string())
          .optional()
          .describe("Additional key/value variables passed to the pipeline"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({
      repoId,
      name,
      schedule,
      branch,
      timezone,
      enabled,
      variables,
    }) => {
      const result = await apiClient.post<Cron>(
        `/repos/${repoId}/cron`,
        definedOnly({ name, schedule, branch, timezone, enabled, variables })
      );

      return toolResponse(
        result,
        (cron) => ({ repoId, created: true, cron: cronContext(cron) }),
        `creating cron job '${name}' in repository ${repoId}`
      );
    }
  );
