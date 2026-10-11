import { z } from "zod";

export const forgeLookupSchema = {
  forgeId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("The forge ID the user belongs to (defaults to the main forge)"),
  forgeRemoteId: z
    .string()
    .optional()
    .describe(
      "The user's ID at the forge (falls back to the login if omitted)"
    ),
};

export const forgeLookupQuery = (forgeId?: number, forgeRemoteId?: string) => {
  const params = new URLSearchParams();

  if (forgeId !== undefined) {
    params.append("forge_id", forgeId.toString());
  }
  if (forgeRemoteId) {
    params.append("forge_remote_id", forgeRemoteId);
  }

  return params;
};
