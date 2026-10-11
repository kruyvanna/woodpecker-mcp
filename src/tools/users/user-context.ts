import type { User } from "@/utils/types.js";

export const userContext = (user: User) => ({
  id: user.id,
  login: user.login,
  email: user.email,
  avatar_url: user.avatar_url,
  admin: user.admin ?? false,
  forge_id: user.forge_id,
  forge_remote_id: user.forge_remote_id,
  org_id: user.org_id,
});
