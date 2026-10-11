// Streamlined type definitions for Woodpecker CI debugging - focused on essential pipeline debugging info

export type StatusValue =
  | "skipped"
  | "pending"
  | "running"
  | "success"
  | "failure"
  | "killed"
  | "error"
  | "blocked"
  | "canceled"
  | "declined"
  | "created";

export type WebhookEvent =
  | "push"
  | "pull_request"
  | "pull_request_closed"
  | "pull_request_metadata"
  | "tag"
  | "release"
  | "deployment"
  | "cron"
  | "manual";

export type StepType = "clone" | "service" | "plugin" | "commands" | "cache";

export type LogEntryType = 0 | 1 | 2 | 3 | 4; // stdout, stderr, exit_code, metadata, progress

export type PipelineErrorType =
  | "linter"
  | "deprecation"
  | "compiler"
  | "generic"
  | "bad_habit";

export type PipelineError = {
  type: PipelineErrorType;
  message: string;
  is_warning: boolean;
  data?: unknown;
};

export type Step = {
  id: number;
  name: string;
  uuid: string;
  type: StepType;
  state: StatusValue;
  error?: string;
  exit_code?: number;
  start_time?: number;
  end_time?: number;
  pipeline_id: number;
};

export type Workflow = {
  id: number;
  name: string;
  state: StatusValue;
  error?: string;
  start_time?: number;
  end_time?: number;
  pipeline_id: number;
  children: Step[];
};

export type Pipeline = {
  id: number;
  number: number;
  parent?: number;
  event: WebhookEvent;
  status: StatusValue;
  errors?: PipelineError[];
  created_at: number;
  updated_at: number;
  started_at?: number;
  finished_at?: number;
  commit: string;
  branch: string;
  ref: string;
  title?: string;
  message?: string;
  author?: string;
  author_email?: string;
  workflows?: Workflow[];
};

export type LogEntry = {
  id: number;
  step_id: number;
  time: number;
  line: number;
  data: string | null;
  type: LogEntryType;
};

export type RepoTrustedConfiguration = {
  network: boolean;
  volumes: boolean;
  security: boolean;
};

export type Repo = {
  id: number;
  forge_remote_id: string;
  name: string;
  owner: string;
  full_name: string;
  default_branch?: string;
  private: boolean;
  trusted: RepoTrustedConfiguration;
  active: boolean;
  config_file?: string;
  timeout?: number;
  forge_id: number;
};

export type Config = {
  name: string;
  data: string;
  hash: string;
};

export type PipelineOptions = {
  message?: string;
  branch: string;
  variables?: Record<string, string>;
};

export type ApprovalMode = "none" | "forks" | "pull_requests" | "all_events";

export type RepoVisibility = "public" | "private" | "internal";

export type RepoPatch = {
  config_file?: string;
  require_approval?: ApprovalMode;
  approval_allowed_users?: string[];
  timeout?: number;
  visibility?: RepoVisibility;
  allow_pr?: boolean;
  allow_deploy?: boolean;
  cancel_previous_pipeline_events?: WebhookEvent[];
  netrc_trusted?: string[];
  trusted?: Partial<RepoTrustedConfiguration>;
  config_extension_endpoint?: string;
  config_extension_exclusive?: boolean;
  config_extension_netrc?: boolean;
  registry_extension_endpoint?: string;
  registry_extension_netrc?: boolean;
  secret_extension_endpoint?: string;
  secret_extension_netrc?: boolean;
};

export type RepoWithLastPipeline = Repo & {
  last_pipeline?: Pipeline;
};

export type RepoPermission = {
  pull: boolean;
  push: boolean;
  admin: boolean;
  synced: number;
  created: number;
  updated: number;
};

export type PullRequest = {
  index: string;
  title: string;
};

export type Feed = {
  repo_id: number;
  full_name?: string;
  id?: number;
  number?: number;
  event?: WebhookEvent;
  status?: StatusValue;
  created?: number;
  started?: number;
  finished?: number;
  commit?: string;
  branch?: string;
  ref?: string;
  title?: string;
  author?: string;
  author_email?: string;
  message?: string;
};

export type Secret = {
  id: number;
  org_id: number;
  repo_id: number;
  name: string;
  value?: string;
  images: string[] | null;
  events: WebhookEvent[] | null;
  note?: string;
};

export type Registry = {
  id: number;
  org_id: number;
  repo_id: number;
  address: string;
  username: string;
  password?: string;
  readonly?: boolean;
};

export type Cron = {
  id: number;
  name: string;
  repo_id: number;
  creator_id: number;
  next_exec: number;
  schedule: string;
  timezone: string;
  created: number;
  branch: string;
  enabled: boolean;
  variables: Record<string, string> | null;
};

export type Agent = {
  id: number;
  created: number;
  updated: number;
  name: string;
  owner_id: number;
  token?: string;
  last_contact: number;
  last_work: number;
  platform: string;
  backend: string;
  capacity: number;
  version: string;
  no_schedule: boolean;
  custom_labels: Record<string, string> | null;
  org_id: number;
  filters: Record<string, string> | null;
};

export type Task = {
  id: string;
  pid: number;
  name: string;
  labels: Record<string, string> | null;
  dependencies: string[] | null;
  run_on: string[] | null;
  dep_status: Record<string, StatusValue> | null;
  agent_id: number;
  agent_name?: string;
  pipeline_id: number;
  repo_id: number;
};

export type QueueInfo = {
  pending: Task[] | null;
  waiting_on_deps: Task[] | null;
  running: Task[] | null;
  stats: {
    worker_count: number;
    pending_count: number;
    waiting_on_deps_count: number;
    running_count: number;
  };
  paused: boolean;
};

export type ForgeType =
  | "github"
  | "gitlab"
  | "gitea"
  | "forgejo"
  | "bitbucket"
  | "bitbucket-dc"
  | "addon";

export type Forge = {
  id: number;
  type: ForgeType;
  url: string;
  client?: string;
  skip_verify?: boolean;
  oauth_host?: string;
  orgs?: string[];
  additional_options?: Record<string, unknown>;
};

export type User = {
  id: number;
  forge_id?: number;
  forge_remote_id: string;
  login: string;
  email: string;
  avatar_url: string;
  admin?: boolean;
  admin_env?: boolean;
  org_id: number;
};

export type Org = {
  id: number;
  forge_id?: number;
  name: string;
  is_user: boolean;
};

export type OrgPermission = {
  member: boolean;
  admin: boolean;
};

export type ServerVersion = {
  source: string;
  version: string;
};

export type LogLevel = {
  "log-level": string;
};

// Custom error types for better error handling
export type WoodpeckerError =
  | { type: "api_error"; status: number; message: string }
  | { type: "network_error"; message: string }
  | { type: "validation_error"; message: string }
  | { type: "not_found"; resource: string; id: string | number }
  | { type: "authorization_error"; message: string };

// Utility types for debugging
export type PipelineDebugInfo = {
  pipeline: Pipeline;
  failedSteps: Step[];
  errorLogs: LogEntry[];
  config?: Config[];
};

export type RepositoryContext = {
  repo: Repo;
  currentBranch?: string;
  currentCommit?: string;
  recentPipelines: Pipeline[];
};
