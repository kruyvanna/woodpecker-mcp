import type { Secret } from "@/utils/types.js";

// Never echo the secret value back, even if the API includes it
export const secretContext = (secret: Secret) => ({
  id: secret.id,
  name: secret.name,
  repo_id: secret.repo_id,
  org_id: secret.org_id,
  events: secret.events,
  images: secret.images,
  note: secret.note,
});
