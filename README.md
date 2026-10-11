# Woodpecker CI MCP Server

A Model Context Protocol (MCP) server that connects AI assistants to Woodpecker CI. Debug pipeline failures, analyze build logs, troubleshoot CI/CD configurations, and and manage your whole Woodpecker instance (pipelines, repositories, secrets, registries, cron jobs, agents, forges, users, organizations and the queue) with AI assistance.

## MCP Client Setup

Add to your MCP client configuration:

### Standalone Binary

```json
{
  "woodpecker-ci": {
    "command": "woodpecker-mcp",
    "env": {
      "WOODPECKER_TOKEN": "your-token-here",
      "WOODPECKER_URL": "https://your-woodpecker-instance.com"
    }
  }
}
```

### Docker

```json
{
  "woodpecker-ci": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-e", "WOODPECKER_TOKEN",
      "-e", "WOODPECKER_URL",
      "ghcr.io/j04n-f/woodpecker-mcp"
    ],
    "env": {
      "WOODPECKER_TOKEN": "your-token-here",
      "WOODPECKER_URL": "https://your-woodpecker-instance.com"
    }
  }
}
```

## Quick Start

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Run the server**
   ```bash
   # Development with inspector
   bun run dev
   ```

3. **Set environment variables using Inspector**
   ```bash
   WOODPECKER_URL="https://your-woodpecker-instance.com"
   WOODPECKER_TOKEN="your-personal-access-token"
   ```

4. **Start development environment**
   ```bash
   # Start Gitea + Woodpecker CI for testing
   ./scripts/setup-environment.sh

   # Access services:
   # - Gitea: http://localhost:3000 (woodpecker/woodpecker123)
   # - Woodpecker: http://localhost:8000
   ```

## Configuration

### Getting Your Woodpecker Token

1. Go to your Woodpecker CI instance
2. Click your profile icon → "CLI & API"
3. Copy the personal access token
4. Set it as `WOODPECKER_TOKEN`

## API Reference

The server covers the Woodpecker CI REST API. Tools marked 🔒 require a Woodpecker admin token, and tools marked ⚠️ are destructive (MCP clients will usually ask before running them).

Secrets, registries and agents take a `scope` parameter, so one tool works at every level: `repo` (with `repoId`), `org` (with `orgId`), or `global` (agents only support `org` and `global`).

### Repositories

| Tool | Description | Parameters |
|------|-------------|------------|
| `search_repository` | Find a repository by full name | `name` (e.g. "owner/repo") |
| `list_repositories` 🔒 | List all repositories on the server | Optional: `page`, `perPage`, `active` |
| `get_repository_by_id` | Get repository details | `repoId` |
| `get_repository_permissions` | Your pull/push/admin access to a repository | `repoId` |
| `list_repository_branches` | List branches | `repoId`, optional pagination |
| `list_repository_pull_requests` | List open pull requests | `repoId`, optional pagination |
| `activate_repository` | Activate a repository | `forgeRemoteId` |
| `update_repository` | Update repository settings (only provided fields change) | `repoId`, optional: `allowPull`, `allowDeploy`, `requireApproval`, `approvalAllowedUsers`, `timeout`, `visibility`, `configFile`, `cancelPreviousPipelineEvents`, `netrcTrusted`, `trustedNetwork`, `trustedVolumes`, `trustedSecurity`, config/registry/secret extension settings |
| `repair_repository` | Repair a repository's webhook | `repoId` |
| `repair_all_repositories` 🔒 | Repair webhooks of all repositories | – |
| `chown_repository` ⚠️ | Make yourself the repository owner | `repoId` |
| `move_repository` ⚠️ | Move the repository to another forge repo | `repoId`, `to` ("owner/repo") |
| `delete_repository` ⚠️ | Deactivate, or fully remove, a repository | `repoId`, optional `remove` |

### Pipelines and logs

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_pipelines` | List repository pipelines | `repoId`, optional: `before`, `after`, `branch`, `event`, `ref`, `status`, pagination |
| `get_pipeline` | Get detailed pipeline info | `repoId`, `number` (or `"latest"`) |
| `get_pipeline_config` | View pipeline configuration | `repoId`, `number` |
| `get_pipeline_metadata` | Pipeline metadata, including previous pipeline info | `repoId`, `number` |
| `create_pipeline` | Trigger a manual pipeline | `repoId`, `branch`, optional: `message`, `variables` |
| `restart_pipeline` | Restart a pipeline | `repoId`, `number`, optional: `event`, `deployTo`, `deployTask`, `environment` |
| `cancel_pipeline` ⚠️ | Cancel a running pipeline | `repoId`, `number` |
| `approve_pipeline` | Approve a pipeline awaiting approval | `repoId`, `number` |
| `decline_pipeline` ⚠️ | Decline a pipeline awaiting approval | `repoId`, `number` |
| `delete_pipeline` ⚠️ | Delete a pipeline | `repoId`, `number` |
| `get_step_logs` | Get logs of a step | `repoId`, `number`, `stepId` |
| `delete_step_logs` ⚠️ | Delete logs of a step | `repoId`, `number`, `stepId` |
| `delete_pipeline_logs` ⚠️ | Delete all logs of a pipeline | `repoId`, `number` |

### Secrets, registries and cron jobs

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_secrets` / `get_secret` | List or inspect secrets (values are never returned) | `scope`, `repoId`/`orgId`, `name` |
| `create_secret` / `update_secret` | Create or update a secret | `scope`, `name`, `value`, optional: `events`, `images`, `note` |
| `delete_secret` ⚠️ | Delete a secret | `scope`, `name` |
| `list_registries` / `get_registry` | List or inspect registry credentials (passwords are never returned) | `scope`, `address` |
| `create_registry` / `update_registry` | Create or update registry credentials | `scope`, `address`, `username`, `password` |
| `delete_registry` ⚠️ | Delete registry credentials | `scope`, `address` |
| `list_crons` / `get_cron` | List or inspect cron jobs | `repoId`, `cronId` |
| `create_cron` / `update_cron` | Create or update a cron job | `repoId`, `name`, `schedule`, optional: `branch`, `timezone`, `enabled`, `variables` |
| `run_cron` | Run a cron job now | `repoId`, `cronId` |
| `delete_cron` ⚠️ | Delete a cron job | `repoId`, `cronId` |

### Users and organizations

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_current_user` | The authenticated user | – |
| `get_user_feed` | Your recent pipelines across repositories | Optional `latest` |
| `list_user_repositories` | Repositories you can access, with their last pipeline | Optional `all`, `name` |
| `sync_user_repositories` | Re-sync your repositories and permissions from the forge | – |
| `list_users` / `get_user` 🔒 | List or inspect users | `login`, optional `forgeId`, `forgeRemoteId` |
| `create_user` / `update_user` 🔒 | Create or update a user | `login`, optional: `email`, `avatarUrl`, `admin`, `newLogin` |
| `delete_user` 🔒 ⚠️ | Delete a user | `login` |
| `list_orgs` 🔒 | List organizations | Optional pagination |
| `get_org` / `lookup_org` | Get an organization by ID or full name | `orgId` / `fullName` |
| `get_org_permissions` | Your membership/admin status in an organization | `orgId` |
| `delete_org` 🔒 ⚠️ | Delete an organization | `orgId` |

### Agents, forges and server

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_agents` | List agents | `scope` (`global` 🔒 or `org`), optional pagination |
| `get_agent` / `list_agent_tasks` 🔒 | Inspect an agent or its running tasks | `agentId` |
| `create_agent` | Register an agent (returns its one-time token) | `scope`, `name`, optional: `noSchedule`, `filters` |
| `update_agent` | Update an agent (only provided fields change) | `scope`, `agentId`, optional: `name`, `noSchedule`, `filters` |
| `delete_agent` ⚠️ | Delete an agent | `scope`, `agentId` |
| `list_forges` / `get_forge` | List or inspect configured forges | `forgeId` |
| `create_forge` / `update_forge` 🔒 | Add or update a forge | `type`, `url`, OAuth settings, `orgs`, `additionalOptions` |
| `delete_forge` 🔒 ⚠️ | Delete a forge | `forgeId` |
| `get_queue_info` 🔒 | Queue stats with pending, waiting and running tasks | – |
| `list_queued_pipelines` 🔒 | Pending and running pipelines across all repositories | – |
| `pause_queue` / `resume_queue` 🔒 | Pause or resume the pipeline queue | – |
| `get_server_info` | Server version and health | – |
| `get_log_level` / `set_log_level` 🔒 | Read or change the server log level | `level` |
| `get_signature_public_key` | Public key used to sign pipeline payloads | – |

#### Not exposed

A few endpoints are intentionally left out because they don't fit a request/response tool or would be unsafe: the SSE streams (`/stream/*`), pprof debug endpoints, the inbound forge webhook (`/hook`), badge images, `/queue/norunningpipelines` (blocks until something runs), and `/user/token` (it returns or resets the token this server authenticates with).

### AI Prompts

| Prompt | Description |
|--------|-------------|
| `review-pipeline-error` | Systematic analysis of pipeline failures |

## Development

### Available Commands

```bash
# Development
bun run dev          # Start with inspector
bun run build        # Build production binary

# Code Quality
bun run lint         # Check code style
bun run lint:fix     # Auto-fix issues
```

### Local Testing Environment

The included Docker Compose setup provides:
- **Gitea**: Git forge with webhooks
- **Woodpecker CI**: Complete CI/CD environment
- **Test repository**: Sample project with pipeline configuration

Perfect for testing MCP integration without external dependencies.

## Examples

### Debug a Failed Pipeline
```
AI: Can you check why pipeline #42 failed for repository owner/project?
```

### Analyze Build Performance
```
AI: Show me the recent pipeline performance for my main repository and identify any bottlenecks.
```

### Configuration Review
```
AI: Review the pipeline configuration for repository owner/project and suggest improvements.
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the coding standards: `bun run lint`
4. Commit changes: `git commit -m 'feat: add amazing feature'`
5. Submit a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Ready to supercharge your Woodpecker CI workflows with AI assistance! 🚀🤖
