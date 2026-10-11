import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "@/utils/api.js";
import { toolResponse } from "@/utils/tool.js";

export const registerGetSignaturePublicKeyTool = (server: McpServer) =>
  server.registerTool(
    "get_signature_public_key",
    {
      title: "Get Signature Public Key",
      description:
        "Get the server's PEM-encoded public key, used to verify signed requests the server sends to config, secret and registry extensions.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await apiClient.get<string>("/signature/public-key");

      return toolResponse(
        result,
        (publicKey) => ({ publicKey }),
        "server signature public key"
      );
    }
  );
