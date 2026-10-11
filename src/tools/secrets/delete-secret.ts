import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  invalidInputResponse,
  scopedPath,
  scopeSchema,
  toolResponse,
} from "@/utils/tool.js";

export const registerDeleteSecretTool = (server: McpServer) =>
  server.registerTool(
    "delete_secret",
    {
      title: "Delete Secret",
      description:
        "Permanently delete a secret. Pipelines that reference it will fail until it is recreated.",
      inputSchema: {
        ...scopeSchema,
        name: z.string().min(1).describe("The name of the secret to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ scope, repoId, orgId, name }) => {
      const base = scopedPath({ scope, repoId, orgId }, "secrets");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.delete<unknown>(
        `${path}/${encodeURIComponent(name)}`
      );

      return toolResponse(
        result,
        () => ({ scope, name, deleted: true }),
        `deleting secret '${name}' in ${label}`
      );
    }
  );
