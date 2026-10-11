import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Forge } from "@/utils/types.js";
import { FORGE_TYPES, forgeContext, forgeFieldsSchema } from "./forge-context";

export const registerCreateForgeTool = (server: McpServer) =>
  server.registerTool(
    "create_forge",
    {
      title: "Create Forge",
      description:
        "Add a new forge (GitHub, GitLab, Gitea, ...) to the Woodpecker server (admin only).",
      inputSchema: {
        type: z.enum(FORGE_TYPES).describe("The forge type"),
        url: forgeFieldsSchema.url,
        client: forgeFieldsSchema.client.optional(),
        oauthClientSecret: forgeFieldsSchema.oauthClientSecret.optional(),
        skipVerify: forgeFieldsSchema.skipVerify.optional(),
        oauthHost: forgeFieldsSchema.oauthHost.optional(),
        orgs: forgeFieldsSchema.orgs.optional(),
        additionalOptions: forgeFieldsSchema.additionalOptions.optional(),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({
      type,
      url,
      client,
      oauthClientSecret,
      skipVerify,
      oauthHost,
      orgs,
      additionalOptions,
    }) => {
      const result = await apiClient.post<Forge>("/forges", {
        type,
        url,
        client: client ?? "",
        oauth_client_secret: oauthClientSecret ?? "",
        skip_verify: skipVerify ?? false,
        oauth_host: oauthHost ?? "",
        orgs: orgs ?? [],
        additional_options: additionalOptions ?? {},
      });

      return toolResponse(
        result,
        (forge) => ({ created: true, forge: forgeContext(forge) }),
        `creating ${type} forge at ${url}`
      );
    }
  );
