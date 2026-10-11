import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  invalidInputResponse,
  scopedPath,
  scopeSchema,
  toolResponse,
  WEBHOOK_EVENTS,
} from "@/utils/tool.js";
import type { Secret } from "@/utils/types.js";
import { secretContext } from "./secret-context";

export const registerCreateSecretTool = (server: McpServer) =>
  server.registerTool(
    "create_secret",
    {
      title: "Create Secret",
      description:
        "Create a secret for a repository, an organization or globally. The secret is exposed to pipeline steps for the selected events (and images, if given).",
      inputSchema: {
        ...scopeSchema,
        name: z.string().min(1).describe("The secret name"),
        value: z.string().min(1).describe("The secret value"),
        events: z
          .array(z.enum(WEBHOOK_EVENTS))
          .min(1)
          .optional()
          .default(["push", "tag", "deployment", "manual"])
          .describe("Webhook events for which the secret is available"),
        images: z
          .array(z.string().min(1))
          .optional()
          .describe(
            "Restrict the secret to these plugin images (empty means available to all)"
          ),
        note: z.string().optional().describe("A free-form note"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ scope, repoId, orgId, name, value, events, images, note }) => {
      const base = scopedPath({ scope, repoId, orgId }, "secrets");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.post<Secret>(path, {
        name,
        value,
        events,
        images: images ?? [],
        note: note ?? "",
      });

      return toolResponse(
        result,
        (secret) => ({ scope, created: true, secret: secretContext(secret) }),
        `creating secret '${name}' in ${label}`
      );
    }
  );
