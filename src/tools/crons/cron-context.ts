import { z } from "zod";
import type { Cron } from "@/utils/types.js";

export const cronIdSchema = z
  .number()
  .int()
  .positive()
  .describe("The cron job ID (see list_crons)");

export const SCHEDULE_DESCRIPTION =
  "Schedule as a cron expression (e.g. '0 0 * * *', optionally with a leading seconds field) or a descriptor such as '@daily', '@hourly' or '@every 1h'";

export const cronContext = (cron: Cron) => ({
  id: cron.id,
  name: cron.name,
  repo_id: cron.repo_id,
  schedule: cron.schedule,
  timezone: cron.timezone,
  branch: cron.branch,
  enabled: cron.enabled,
  variables: cron.variables,
  next_exec: cron.next_exec,
  created: cron.created,
});
