import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Ok, type Result } from "ts-results";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import type { ApiError } from "@/utils/error.js";
import { definedOnly, errorResponse, WEBHOOK_EVENTS } from "@/utils/tool.js";
import type { Repo, RepoPatch, WebhookEvent } from "@/utils/types.js";

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

type UpdateRepositoryFields = {
  allowPull?: boolean;
  allowDeploy?: boolean;
  requireApproval?: RepoPatch["require_approval"];
  approvalAllowedUsers?: string[];
  timeout?: number;
  visibility?: RepoPatch["visibility"];
  configFile?: string;
  cancelPreviousPipelineEvents?: WebhookEvent[];
  netrcTrusted?: string[];
  trustedNetwork?: boolean;
  trustedVolumes?: boolean;
  trustedSecurity?: boolean;
  configExtensionEndpoint?: string;
  configExtensionExclusive?: boolean;
  configExtensionNetrc?: boolean;
  registryExtensionEndpoint?: string;
  registryExtensionNetrc?: boolean;
  secretExtensionEndpoint?: string;
  secretExtensionNetrc?: boolean;
};

// Older servers replace the whole trusted object, so merge the provided flags
// into the current ones to avoid resetting the others
const resolveTrustedPatch = async (
  repoId: number,
  fields: UpdateRepositoryFields
): Promise<Result<RepoPatch["trusted"], ApiError>> => {
  const { trustedNetwork, trustedVolumes, trustedSecurity } = fields;

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

// The API applies only the fields present in the body, so omitted fields are left as-is
const buildRepoPatch = (
  fields: UpdateRepositoryFields,
  trusted: RepoPatch["trusted"]
): RepoPatch =>
  definedOnly({
    allow_pr: fields.allowPull,
    allow_deploy: fields.allowDeploy,
    require_approval: fields.requireApproval,
    approval_allowed_users: fields.approvalAllowedUsers,
    timeout: fields.timeout,
    visibility: fields.visibility,
    config_file: fields.configFile,
    cancel_previous_pipeline_events: fields.cancelPreviousPipelineEvents,
    netrc_trusted: fields.netrcTrusted,
    trusted,
    config_extension_endpoint: fields.configExtensionEndpoint,
    config_extension_exclusive: fields.configExtensionExclusive,
    config_extension_netrc: fields.configExtensionNetrc,
    registry_extension_endpoint: fields.registryExtensionEndpoint,
    registry_extension_netrc: fields.registryExtensionNetrc,
    secret_extension_endpoint: fields.secretExtensionEndpoint,
    secret_extension_netrc: fields.secretExtensionNetrc,
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
        approvalAllowedUsers: z
          .array(z.string().min(1))
          .optional()
          .describe(
            "Users whose pipelines never require approval (empty array clears the list)"
          ),
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
        netrcTrusted: z
          .array(z.string().min(1))
          .optional()
          .describe(
            "Plugin images that are allowed to receive the netrc (forge clone) credentials"
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
        configExtensionEndpoint: z
          .string()
          .optional()
          .describe(
            "URL of a config extension service that provides or rewrites pipeline configs (empty string disables it)"
          ),
        configExtensionExclusive: z
          .boolean()
          .optional()
          .describe(
            "Use only the config extension's configs instead of merging them with the repository's"
          ),
        configExtensionNetrc: z
          .boolean()
          .optional()
          .describe("Send netrc credentials to the config extension"),
        registryExtensionEndpoint: z
          .string()
          .optional()
          .describe(
            "URL of a registry extension service that provides registry credentials (empty string disables it)"
          ),
        registryExtensionNetrc: z
          .boolean()
          .optional()
          .describe("Send netrc credentials to the registry extension"),
        secretExtensionEndpoint: z
          .string()
          .optional()
          .describe(
            "URL of a secret extension service that provides secrets (empty string disables it)"
          ),
        secretExtensionNetrc: z
          .boolean()
          .optional()
          .describe("Send netrc credentials to the secret extension"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ repoId, ...fields }) => {
      const trusted = await resolveTrustedPatch(repoId, fields);
      if (trusted.err) {
        return errorResponse(trusted.val, `updating repository ${repoId}`);
      }

      const result = await apiClient.patch<Repo>(
        `/repos/${repoId}`,
        buildRepoPatch(fields, trusted.val)
      );

      const text = result
        .map((val) => updatedRepositoryContext(repoId, val))
        .mapErr((err) => err.toContext(`updating repository ${repoId}`));

      return {
        content: [{ type: "text", text: text.val }],
        isError: result.err,
      };
    }
  );
