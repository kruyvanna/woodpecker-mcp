import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Ok, type Result } from "ts-results";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import type { ApiError } from "@/utils/error.js";
import type { Repo, RepoPatch, WebhookEvent } from "@/utils/types.js";

type TrustedOverrides = {
  trustedNetwork?: boolean;
  trustedVolumes?: boolean;
  trustedSecurity?: boolean;
};

const resolveTrustedPatch = async (
  repoId: number,
  overrides: TrustedOverrides
): Promise<Result<RepoPatch["trusted"], ApiError>> => {
  const { trustedNetwork, trustedVolumes, trustedSecurity } = overrides;

  if (
    trustedNetwork === undefined &&
    trustedVolumes === undefined &&
    trustedSecurity === undefined
  ) {
    return Ok(undefined);
  }

  const currentRepo = await apiClient.get<Repo>(`/repos/${repoId}`);

  return currentRepo.map((repo) => ({
    network: trustedNetwork ?? repo.trusted.network,
    volumes: trustedVolumes ?? repo.trusted.volumes,
    security: trustedSecurity ?? repo.trusted.security,
  }));
};

const WEBHOOK_EVENTS = [
  "push",
  "pull_request",
  "pull_request_closed",
  "tag",
  "release",
  "deployment",
  "cron",
  "manual",
] as const satisfies readonly WebhookEvent[];

const updatedRepositoryContext = (repoId: number, repo: Repo) =>
  JSON.stringify({
    repoId,
    repository: {
      id: repo.id,
      name: repo.name,
      owner: repo.owner,
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      private: repo.private,
      trusted: repo.trusted,
      active: repo.active,
      config_file: repo.config_file,
      timeout: repo.timeout,
    },
  });

const errorResponse = (error: ApiError, context: string) => ({
  content: [{ type: "text" as const, text: error.toContext(context) }],
  isError: true,
});

type UpdateRepositoryFields = {
  allowPull?: boolean;
  allowDeploy?: boolean;
  requireApproval?: RepoPatch["require_approval"];
  timeout?: number;
  visibility?: RepoPatch["visibility"];
  configFile?: string;
  cancelPreviousPipelineEvents?: WebhookEvent[];
  trusted?: RepoPatch["trusted"];
};

const buildRepoPatch = (fields: UpdateRepositoryFields): RepoPatch => ({
  ...(fields.allowPull === undefined ? {} : { allow_pr: fields.allowPull }),
  ...(fields.allowDeploy === undefined
    ? {}
    : { allow_deploy: fields.allowDeploy }),
  ...(fields.requireApproval === undefined
    ? {}
    : { require_approval: fields.requireApproval }),
  ...(fields.timeout === undefined ? {} : { timeout: fields.timeout }),
  ...(fields.visibility === undefined ? {} : { visibility: fields.visibility }),
  ...(fields.configFile === undefined
    ? {}
    : { config_file: fields.configFile }),
  ...(fields.cancelPreviousPipelineEvents === undefined
    ? {}
    : {
        cancel_previous_pipeline_events: fields.cancelPreviousPipelineEvents,
      }),
  ...(fields.trusted === undefined ? {} : { trusted: fields.trusted }),
});

export const registerUpdateRepositoryTool = (server: McpServer) =>
  server.registerTool(
    "update_repository",
    {
      title: "Update Repository",
      description:
        "Update a repository's Woodpecker CI settings. Only the provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        allowPull: z
          .boolean()
          .optional()
          .describe("Allow pipelines to run for pull requests"),
        allowDeploy: z
          .boolean()
          .optional()
          .describe("Allow deployment pipelines for this repository"),
        requireApproval: z
          .enum(["none", "forks", "pull_requests", "all_events"])
          .optional()
          .describe("Which events require manual approval before running"),
        timeout: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Pipeline timeout in minutes"),
        visibility: z
          .enum(["public", "private", "internal"])
          .optional()
          .describe("Who can see this repository's pipelines"),
        configFile: z
          .string()
          .optional()
          .describe(
            "Path to the pipeline configuration file (e.g. '.woodpecker.yml')"
          ),
        cancelPreviousPipelineEvents: z
          .array(z.enum(WEBHOOK_EVENTS))
          .optional()
          .describe(
            "Webhook events for which previous running pipelines are canceled when a new one starts"
          ),
        trustedNetwork: z
          .boolean()
          .optional()
          .describe(
            "Trusted: allow pipeline containers to change network privileges (e.g. DNS)"
          ),
        trustedVolumes: z
          .boolean()
          .optional()
          .describe("Trusted: allow pipeline containers to mount volumes"),
        trustedSecurity: z
          .boolean()
          .optional()
          .describe(
            "Trusted: allow pipeline containers to access security privileges"
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({
      repoId,
      allowPull,
      allowDeploy,
      requireApproval,
      timeout,
      visibility,
      configFile,
      cancelPreviousPipelineEvents,
      trustedNetwork,
      trustedVolumes,
      trustedSecurity,
    }) => {
      const context = `updating repository ${repoId}`;

      const trustedResult = await resolveTrustedPatch(repoId, {
        trustedNetwork,
        trustedVolumes,
        trustedSecurity,
      });

      if (trustedResult.err) {
        return errorResponse(trustedResult.val, context);
      }

      const patch = buildRepoPatch({
        allowPull,
        allowDeploy,
        requireApproval,
        timeout,
        visibility,
        configFile,
        cancelPreviousPipelineEvents,
        trusted: trustedResult.val,
      });

      const result = await apiClient.patch<Repo>(`/repos/${repoId}`, patch);

      if (result.err) {
        return errorResponse(result.val, context);
      }

      return {
        content: [
          { type: "text", text: updatedRepositoryContext(repoId, result.val) },
        ],
        isError: false,
      };
    }
  );
