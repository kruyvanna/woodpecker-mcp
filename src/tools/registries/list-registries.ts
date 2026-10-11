import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import {
  invalidInputResponse,
  paginationQuery,
  paginationSchema,
  scopedPath,
  scopeSchema,
  toolResponse,
  withQuery,
} from "@/utils/tool.js";
import type { Registry } from "@/utils/types.js";
import { registryContext } from "./registry-context";

export const registerListRegistriesTool = (server: McpServer) =>
  server.registerTool(
    "list_registries",
    {
      title: "List Registries",
      description:
        "List container registry credentials of a repository, an organization or the whole server (global). Passwords are never returned.",
      inputSchema: {
        ...scopeSchema,
        ...paginationSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ scope, repoId, orgId, page, perPage }) => {
      const base = scopedPath({ scope, repoId, orgId }, "registries");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.get<Registry[] | null>(
        withQuery(path, paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (registries) => ({
          scope,
          registries: (registries ?? []).map(registryContext),
          count: registries?.length ?? 0,
        }),
        `registries of ${label}`
      );
    }
  );
