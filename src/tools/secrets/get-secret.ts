import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  invalidInputResponse,
  scopedPath,
  scopeSchema,
  toolResponse,
} from "@/utils/tool.js";
import type { Secret } from "@/utils/types.js";
import { secretContext } from "./secret-context";

export const registerGetSecretTool = (server: McpServer) =>
  server.registerTool(
    "get_secret",
    {
      title: "Get Secret",
      description:
        "Get a secret's metadata (allowed events, images, note) by name. The secret value is never returned.",
      inputSchema: {
        ...scopeSchema,
        name: z.string().min(1).describe("The secret name"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ scope, repoId, orgId, name }) => {
      const base = scopedPath({ scope, repoId, orgId }, "secrets");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.get<Secret>(
        `${path}/${encodeURIComponent(name)}`
      );

      return toolResponse(
        result,
        (secret) => ({ scope, secret: secretContext(secret) }),
        `secret '${name}' of ${label}`
      );
    }
  );
