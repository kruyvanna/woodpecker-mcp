import type { Org } from "@/utils/types.js";

export const orgContext = (org: Org) => ({
  id: org.id,
  name: org.name,
  is_user: org.is_user,
  forge_id: org.forge_id,
});
