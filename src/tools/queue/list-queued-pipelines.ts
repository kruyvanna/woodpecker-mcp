import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { Feed } from "@/utils/types.js";

export const registerListQueuedPipelinesTool = (server: McpServer) =>
  server.registerTool(
    "list_queued_pipelines",
    {
      title: "List Queued Pipelines",
      description:
        "List pending and running pipelines across all repositories (admin only).",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await apiClient.get<Feed[] | null>("/pipelines");

      return toolResponse(
        result,
        (pipelines) => ({
          pipelines: (pipelines ?? []).map((pipeline) => ({
            repo_id: pipeline.repo_id,
            full_name: pipeline.full_name,
            id: pipeline.id,
            number: pipeline.number,
            status: pipeline.status,
            event: pipeline.event,
            branch: pipeline.branch,
            ref: pipeline.ref,
            commit: pipeline.commit,
            title: pipeline.title,
            author: pipeline.author,
            created: pipeline.created,
            started: pipeline.started,
          })),
          count: pipelines?.length ?? 0,
        }),
        "queued pipelines"
      );
    }
  );
