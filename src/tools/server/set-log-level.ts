import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";
import type { LogLevel } from "@/utils/types.js";

export const registerSetLogLevelTool = (server: McpServer) =>
  server.registerTool(
    "set_log_level",
    {
      title: "Set Log Level",
      description:
        "Change the Woodpecker CI server's log level at runtime (admin only). Useful to temporarily enable debug logging.",
      inputSchema: {
        level: z
          .enum([
            "debug",
            "trace",
            "info",
            "warn",
            "error",
            "fatal",
            "panic",
            "disabled",
          ])
          .describe("The new log level"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ level }) => {
      const result = await apiClient.post<LogLevel>("/log-level", {
        "log-level": level,
      });

      return toolResponse(
        result,
        (val) => ({ logLevel: val["log-level"], updated: true }),
        `setting server log level to '${level}'`
      );
    }
  );
