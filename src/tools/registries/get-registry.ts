import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  invalidInputResponse,
  scopedPath,
  scopeSchema,
  toolResponse,
} from "@/utils/tool.js";
import type { Registry } from "@/utils/types.js";
import { registryContext } from "./registry-context";

export const registerGetRegistryTool = (server: McpServer) =>
  server.registerTool(
    "get_registry",
    {
      title: "Get Registry",
      description:
        "Get a container registry credential by its address. The password is never returned.",
      inputSchema: {
        ...scopeSchema,
        address: z
          .string()
          .min(1)
          .describe("The registry address (e.g. 'docker.io', 'ghcr.io')"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ scope, repoId, orgId, address }) => {
      const base = scopedPath({ scope, repoId, orgId }, "registries");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.get<Registry>(
        `${path}/${encodeURIComponent(address)}`
      );

      return toolResponse(
        result,
        (registry) => ({ scope, registry: registryContext(registry) }),
        `registry '${address}' of ${label}`
      );
    }
  );
