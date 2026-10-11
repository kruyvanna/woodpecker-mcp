import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  definedOnly,
  invalidInputResponse,
  scopedPath,
  scopeSchema,
  toolResponse,
} from "@/utils/tool.js";
import type { Registry } from "@/utils/types.js";
import { registryContext } from "./registry-context";

export const registerUpdateRegistryTool = (server: McpServer) =>
  server.registerTool(
    "update_registry",
    {
      title: "Update Registry",
      description:
        "Update container registry credentials. Only the provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        ...scopeSchema,
        address: z
          .string()
          .min(1)
          .describe("The address of the registry to update"),
        username: z
          .string()
          .min(1)
          .optional()
          .describe("The new registry username"),
        password: z
          .string()
          .min(1)
          .optional()
          .describe("The new registry password or token"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ scope, repoId, orgId, address, username, password }) => {
      const base = scopedPath({ scope, repoId, orgId }, "registries");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.patch<Registry>(
        `${path}/${encodeURIComponent(address)}`,
        { address, ...definedOnly({ username, password }) }
      );

      return toolResponse(
        result,
        (registry) => ({
          scope,
          updated: true,
          registry: registryContext({ ...registry, address }),
        }),
        `updating registry '${address}' in ${label}`
      );
    }
  );
