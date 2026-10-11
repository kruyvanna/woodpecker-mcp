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

export const registerCreateRegistryTool = (server: McpServer) =>
  server.registerTool(
    "create_registry",
    {
      title: "Create Registry",
      description:
        "Add container registry credentials for a repository, an organization or globally, used to pull private images in pipelines.",
      inputSchema: {
        ...scopeSchema,
        address: z
          .string()
          .min(1)
          .describe("The registry address (e.g. 'docker.io', 'ghcr.io')"),
        username: z.string().min(1).describe("The registry username"),
        password: z.string().min(1).describe("The registry password or token"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    async ({ scope, repoId, orgId, address, username, password }) => {
      const base = scopedPath({ scope, repoId, orgId }, "registries");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.post<Registry>(path, {
        address,
        username,
        password,
      });

      return toolResponse(
        result,
        (registry) => ({
          scope,
          created: true,
          registry: registryContext(registry),
        }),
        `creating registry '${address}' in ${label}`
      );
    }
  );
