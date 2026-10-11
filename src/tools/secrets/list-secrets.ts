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
import type { Secret } from "@/utils/types.js";
import { secretContext } from "./secret-context";

export const registerListSecretsTool = (server: McpServer) =>
  server.registerTool(
    "list_secrets",
    {
      title: "List Secrets",
      description:
        "List secrets of a repository, an organization or the whole server (global). Secret values are never returned.",
      inputSchema: {
        ...scopeSchema,
        ...paginationSchema,
      },
      annotations: { readOnlyHint: true },
    },
    async ({ scope, repoId, orgId, page, perPage }) => {
      const base = scopedPath({ scope, repoId, orgId }, "secrets");
      if (base.err) {
        return invalidInputResponse(base.val);
      }
      const { path, label } = base.val;

      const result = await apiClient.get<Secret[] | null>(
        withQuery(path, paginationQuery(page, perPage))
      );

      return toolResponse(
        result,
        (secrets) => ({
          scope,
          secrets: (secrets ?? []).map(secretContext),
          count: secrets?.length ?? 0,
        }),
        `secrets of ${label}`
      );
    }
  );
