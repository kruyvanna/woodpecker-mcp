import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import type { ApiError } from "@/utils/error.js";
import type { WebhookEvent } from "@/utils/types.js";

// Shared building blocks for tool definitions

export const WEBHOOK_EVENTS = [
  "push",
  "pull_request",
  "pull_request_closed",
  "pull_request_metadata",
  "tag",
  "release",
  "deployment",
  "cron",
  "manual",
] as const satisfies readonly WebhookEvent[];

export const paginationSchema = {
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .default(1)
    .describe("Page number for pagination"),
  perPage: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe("Number of items per page"),
};

export const paginationQuery = (page: number, perPage: number) =>
  new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });

export const withQuery = (endpoint: string, params: URLSearchParams) => {
  const query = params.toString();
  return query ? `${endpoint}?${query}` : endpoint;
};

export const textResponse = (text: string, isError = false) => ({
  content: [{ type: "text" as const, text }],
  isError,
});

export const errorResponse = (error: ApiError, context: string) =>
  textResponse(error.toContext(context), true);

export const invalidInputResponse = (message: string) =>
  textResponse(
    JSON.stringify({ error: "INVALID_INPUT", description: message }),
    true
  );

/**
 * Turn an API result into a tool response: the success value is mapped and
 * serialized, the error is described in the given context.
 */
export const toolResponse = <T>(
  result: Result<T, ApiError>,
  onOk: (val: T) => unknown,
  context: string
) => {
  const text = result
    .map((val) => JSON.stringify(onOk(val)))
    .mapErr((err) => err.toContext(context));

  return textResponse(text.val, result.err);
};

// Removes keys whose value is undefined so PATCH bodies only carry provided fields
export const definedOnly = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;

// Secrets, registries and agents live at repository, organization or global scope

export type Scope = "repo" | "org" | "global";

export const scopeSchema = {
  scope: z
    .enum(["repo", "org", "global"])
    .describe(
      "Where the resource lives: 'repo' (requires repoId), 'org' (requires orgId) or 'global' (server-wide, admin only for writes)"
    ),
  repoId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("The repository ID, required when scope is 'repo'"),
  orgId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("The organization ID, required when scope is 'org'"),
};

export type ScopeInput = {
  scope: Scope;
  repoId?: number;
  orgId?: number;
};

/**
 * Resolve the base path for a scoped resource collection
 * (e.g. "secrets" -> "/repos/1/secrets", "/orgs/2/secrets" or "/secrets").
 */
export const scopedPath = (
  { scope, repoId, orgId }: ScopeInput,
  collection: string
): Result<{ path: string; label: string }, string> => {
  if (scope === "repo") {
    return repoId === undefined
      ? Err("repoId is required when scope is 'repo'")
      : Ok({
          path: `/repos/${repoId}/${collection}`,
          label: `repository ${repoId}`,
        });
  }
  if (scope === "org") {
    return orgId === undefined
      ? Err("orgId is required when scope is 'org'")
      : Ok({
          path: `/orgs/${orgId}/${collection}`,
          label: `organization ${orgId}`,
        });
  }
  return Ok({ path: `/${collection}`, label: "global scope" });
};
