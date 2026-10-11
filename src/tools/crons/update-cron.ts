import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { definedOnly, toolResponse } from "@/utils/tool.js";
import type { Cron } from "@/utils/types.js";
import {
  cronContext,
  cronIdSchema,
  SCHEDULE_DESCRIPTION,
} from "./cron-context";

export const registerUpdateCronTool = (server: McpServer) =>
  server.registerTool(
    "update_cron",
    {
      title: "Update Cron Job",
      description:
        "Update a repository cron job. Only the provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        cronId: cronIdSchema,
        name: z.string().min(1).optional().describe("The new cron job name"),
        schedule: z.string().min(1).optional().describe(SCHEDULE_DESCRIPTION),
        timezone: z
          .string()
          .min(1)
          .optional()
          .describe("IANA timezone for the schedule (e.g. 'Europe/Berlin')"),
        branch: z
          .string()
          .min(1)
          .optional()
          .describe("Branch to run the pipeline on"),
        enabled: z
          .boolean()
          .optional()
          .describe("Enable or disable the cron job"),
        variables: z
          .record(z.string())
          .optional()
          .describe("Replace the key/value variables passed to the pipeline"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({
      repoId,
      cronId,
      name,
      schedule,
      timezone,
      branch,
      enabled,
      variables,
    }) => {
      const result = await apiClient.patch<Cron>(
        `/repos/${repoId}/cron/${cronId}`,
        definedOnly({ name, schedule, timezone, branch, enabled, variables })
      );

      return toolResponse(
        result,
        (cron) => ({ repoId, updated: true, cron: cronContext(cron) }),
        `updating cron job ${cronId} in repository ${repoId}`
      );
    }
  );
