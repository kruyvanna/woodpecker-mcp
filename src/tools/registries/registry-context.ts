import type { Registry } from "@/utils/types.js";

// Never echo the registry password back, even if the API includes it
export const registryContext = (registry: Registry) => ({
  id: registry.id,
  address: registry.address,
  username: registry.username,
  repo_id: registry.repo_id,
  org_id: registry.org_id,
  readonly: registry.readonly,
});
