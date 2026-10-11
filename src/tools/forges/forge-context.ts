import { z } from "zod";
import type { Forge, ForgeType } from "@/utils/types.js";

export const FORGE_TYPES = [
  "github",
  "gitlab",
  "gitea",
  "forgejo",
  "bitbucket",
  "bitbucket-dc",
  "addon",
] as const satisfies readonly ForgeType[];

export const forgeFieldsSchema = {
  url: z.string().url().describe("The forge base URL"),
  client: z.string().describe("The OAuth client ID"),
  oauthClientSecret: z.string().describe("The OAuth client secret"),
  skipVerify: z.boolean().describe("Skip TLS certificate verification"),
  oauthHost: z
    .string()
    .describe("Public OAuth URL, if different from the forge URL"),
  orgs: z
    .array(z.string().min(1))
    .describe(
      "Members of these organizations may log in through this forge (in addition to globally allowed ones)"
    ),
  additionalOptions: z
    .record(z.unknown())
    .describe("Forge-type specific options"),
};

// The OAuth client secret is never part of the output
export const forgeContext = (forge: Forge) => ({
  id: forge.id,
  type: forge.type,
  url: forge.url,
  client: forge.client,
  skip_verify: forge.skip_verify,
  oauth_host: forge.oauth_host,
  orgs: forge.orgs,
  additional_options: forge.additional_options,
});
