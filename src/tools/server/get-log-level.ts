import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { LogLevel } from "@/utils/types.js";

export const registerGetLogLevelTool = (server: McpServer) =>
  server.registerTool(
    "get_log_level",
    {
      title: "Get Log Level",
      description:
        "Get the Woodpecker CI server's current log level (admin only).",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await apiClient.get<LogLevel>("/log-level");

      return toolResponse(
        result,
        (val) => ({ logLevel: val["log-level"] }),
        "server log level"
      );
    }
  );
