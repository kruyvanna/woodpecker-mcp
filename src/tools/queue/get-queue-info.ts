import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { QueueInfo, Task } from "@/utils/types.js";

const taskContext = (task: Task) => ({
  id: task.id,
  name: task.name,
  pipeline_id: task.pipeline_id,
  repo_id: task.repo_id,
  agent_id: task.agent_id,
  agent_name: task.agent_name,
  labels: task.labels,
});

export const registerGetQueueInfoTool = (server: McpServer) =>
  server.registerTool(
    "get_queue_info",
    {
      title: "Get Queue Info",
      description:
        "Get the pipeline queue state (admin only): pending, waiting and running tasks, worker counts, and whether the queue is paused. Useful when pipelines are stuck in pending.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await apiClient.get<QueueInfo>("/queue/info");

      return toolResponse(
        result,
        (info) => ({
          paused: info.paused,
          stats: info.stats,
          pending: (info.pending ?? []).map(taskContext),
          waitingOnDeps: (info.waiting_on_deps ?? []).map(taskContext),
          running: (info.running ?? []).map(taskContext),
        }),
        "queue info"
      );
    }
  );
