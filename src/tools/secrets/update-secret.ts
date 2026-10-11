import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  definedOnly,
  invalidInputResponse,
  scopedPath,
  scopeSchema,
  toolResponse,
  WEBHOOK_EVENTS,
} from "@/utils/tool.js";
import type { Secret } from "@/utils/types.js";
import { secretContext } from "./secret-context";

export const registerUpdateSecretTool = (server: McpServer) =>
  server.registerTool(
    "update_secret",
    {
      title: "Update Secret",
      description:
        "Update an existing secret. Only the provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        ...scopeSchema,
        name: z.string().min(1).describe("The name of the secret to update"),
        value: z.string().min(1).optional().describe("The new secret value"),
        events: z
          .array(z.enum(WEBHOOK_EVENTS))
          .min(1)
          .optional()
          .describe("Webhook events for which the secret is available"),
        images: z
          .array(z.string().min(1))
          .optional()
          .describe(
            "Restrict the secret to these plugin images (empty array removes the restriction)"
          ),
        note: z.string().optional().describe("A free-form note"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ scope, repoId, orgId, name, value, events, images, note }) => {
      const base = scopedPath({ scope, repoId, orgId }, "secrets");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.patch<Secret>(
        `${path}/${encodeURIComponent(name)}`,
        definedOnly({ value, events, images, note })
      );

      return toolResponse(
        result,
        (secret) => ({ scope, updated: true, secret: secretContext(secret) }),
        `updating secret '${name}' in ${label}`
      );
    }
  );
