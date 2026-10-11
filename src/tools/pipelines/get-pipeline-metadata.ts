import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerGetPipelineMetadataTool = (server: McpServer) =>
  server.registerTool(
    "get_pipeline_metadata",
    {
      title: "Get Pipeline Metadata",
      description:
        "Get the metadata Woodpecker passes to a pipeline (repository, commit, forge, previous pipeline info, etc. — the source of the CI_* environment variables). Useful for debugging conditions and variable values. Requires push access.",
      inputSchema: {
        repoId: z.number().int().positive().describe("The repository ID"),
        number: z.number().int().positive().describe("The pipeline number"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ repoId, number }) => {
      const result = await apiClient.get<unknown>(
        `/repos/${repoId}/pipelines/${number}/metadata`
      );

      return toolResponse(
        result,
        (metadata) => ({ repoId, number, metadata }),
        `metadata of pipeline ${number} in repository ${repoId}`
      );
    }
  );
