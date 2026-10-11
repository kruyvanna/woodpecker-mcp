import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { errorResponse, toolResponse } from "@/utils/tool.js";
import type { Forge } from "@/utils/types.js";
import { FORGE_TYPES, forgeContext, forgeFieldsSchema } from "./forge-context";

export const registerUpdateForgeTool = (server: McpServer) =>
  server.registerTool(
    "update_forge",
    {
      title: "Update Forge",
      description:
        "Update a forge's configuration (admin only). Only the provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        forgeId: z.number().int().positive().describe("The forge ID"),
        type: z.enum(FORGE_TYPES).optional().describe("The forge type"),
        url: forgeFieldsSchema.url.optional(),
        client: forgeFieldsSchema.client.optional(),
        oauthClientSecret: forgeFieldsSchema.oauthClientSecret
          .min(1)
          .optional(),
        skipVerify: forgeFieldsSchema.skipVerify.optional(),
        oauthHost: forgeFieldsSchema.oauthHost.optional(),
        orgs: forgeFieldsSchema.orgs.optional(),
        additionalOptions: forgeFieldsSchema.additionalOptions.optional(),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({
      forgeId,
      type,
      url,
      client,
      oauthClientSecret,
      skipVerify,
      oauthHost,
      orgs,
      additionalOptions,
    }) => {
      const context = `updating forge ${forgeId}`;

      // The server replaces every field (except an empty client secret), so merge onto the current forge
      const current = await apiClient.get<Forge>(`/forges/${forgeId}`);
      if (current.err) {
        return errorResponse(current.val, context);
      }
      const forge = current.val;

      const result = await apiClient.patch<Forge>(`/forges/${forgeId}`, {
        type: type ?? forge.type,
        url: url ?? forge.url,
        client: client ?? forge.client ?? "",
        oauth_client_secret: oauthClientSecret ?? "",
        skip_verify: skipVerify ?? forge.skip_verify ?? false,
        oauth_host: oauthHost ?? forge.oauth_host ?? "",
        orgs: orgs ?? forge.orgs ?? [],
        additional_options: additionalOptions ?? forge.additional_options ?? {},
      });

      return toolResponse(
        result,
        (updated) => ({ updated: true, forge: forgeContext(updated) }),
        context
      );
    }
  );
