import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { ServerVersion } from "@/utils/types.js";

export const registerGetServerInfoTool = (server: McpServer) =>
  server.registerTool(
    "get_server_info",
    {
      title: "Get Server Info",
      description:
        "Get the Woodpecker CI server version and health status. Useful to check connectivity and which API features are available.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const [version, health] = await Promise.all([
        apiClient.get<ServerVersion>("/version"),
        apiClient.get<unknown>("/healthz"),
      ]);

      return toolResponse(
        version,
        (val) => ({
          version: val.version,
          source: val.source,
          healthy: health.ok,
        }),
        "server version"
      );
    }
  );
