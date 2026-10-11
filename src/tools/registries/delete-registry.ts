import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import {
  invalidInputResponse,
  scopedPath,
  scopeSchema,
  toolResponse,
} from "@/utils/tool.js";

export const registerDeleteRegistryTool = (server: McpServer) =>
  server.registerTool(
    "delete_registry",
    {
      title: "Delete Registry",
      description:
        "Permanently delete container registry credentials. Pipelines pulling private images from it may fail.",
      inputSchema: {
        ...scopeSchema,
        address: z
          .string()
          .min(1)
          .describe("The address of the registry to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    async ({ scope, repoId, orgId, address }) => {
      const base = scopedPath({ scope, repoId, orgId }, "registries");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.delete<unknown>(
        `${path}/${encodeURIComponent(address)}`
      );

      return toolResponse(
        result,
        () => ({ scope, address, deleted: true }),
        `deleting registry '${address}' in ${label}`
      );
    }
  );
