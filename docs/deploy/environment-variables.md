---
title: Environment Variables
summary: Full environment variable reference
---

All environment variables that Paperclip uses for server configuration.

## Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3100` | Server port |
| `HOST` | `127.0.0.1` | Server host binding |
| `DATABASE_URL` | (embedded) | PostgreSQL connection string |
| `PAPERCLIP_HOME` | `~/.paperclip` | Base directory for all Paperclip data |
| `PAPERCLIP_INSTANCE_ID` | `default` | Instance identifier (for multiple local instances) |
| `PAPERCLIP_DEPLOYMENT_MODE` | `local_trusted` | Runtime mode override |

## Secrets

| Variable | Default | Description |
|----------|---------|-------------|
| `PAPERCLIP_SECRETS_MASTER_KEY` | (from file) | 32-byte encryption key (base64/hex/raw) |
| `PAPERCLIP_SECRETS_MASTER_KEY_FILE` | `~/.paperclip/.../secrets/master.key` | Path to key file |
| `PAPERCLIP_SECRETS_STRICT_MODE` | `false` | Require secret refs for sensitive env vars |

## Agent Runtime (Injected into agent processes)

These are set automatically by the server when invoking agents:

| Variable | Description |
|----------|-------------|
| `PAPERCLIP_AGENT_ID` | Agent's unique ID |
| `PAPERCLIP_COMPANY_ID` | Company ID |
| `PAPERCLIP_API_URL` | Paperclip API base URL |
| `PAPERCLIP_API_KEY` | Short-lived JWT for API auth |
| `PAPERCLIP_RUN_ID` | Current heartbeat run ID |
| `PAPERCLIP_TASK_ID` | Issue that triggered this wake |
| `PAPERCLIP_WAKE_REASON` | Wake trigger reason |
| `PAPERCLIP_WAKE_COMMENT_ID` | Comment that triggered this wake |
| `PAPERCLIP_APPROVAL_ID` | Resolved approval ID |
| `PAPERCLIP_APPROVAL_STATUS` | Approval decision |
| `PAPERCLIP_LINKED_ISSUE_IDS` | Comma-separated linked issue IDs |

## LLM Provider Keys (for adapters)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude Local adapter) |
| `OPENAI_API_KEY` | OpenAI API key (for Codex Local adapter) |

## Authenticated mode (Better Auth)

| Variable | Description |
|----------|-------------|
| `PAPERCLIP_PUBLIC_URL` | Public URL of the app (used for auth redirects and trusted-origin derivation). |
| `PAPERCLIP_AUTH_PUBLIC_BASE_URL` | Override auth base URL (defaults from `PAPERCLIP_PUBLIC_URL` or, on Railway, from `RAILWAY_STATIC_URL`). |
| `RAILWAY_STATIC_URL` | (Railway) Custom domain hostname, e.g. `agents.example.com`. When set, it is added to allowed hostnames and used as the auth base URL so login works at the custom domain. |
| `PAPERCLIP_ALLOWED_HOSTNAMES` | Comma-separated hostnames allowed for auth (trusted origins). |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated full origins, e.g. `https://agents.example.com`. Merged with derived origins. |
| `PAPERCLIP_AUTH_DISABLE_SIGN_UP` | Set to `true` to disable self-service sign-up (use bootstrap invite for first user). |

**First user:** Sign up at the app URL, or run `paperclipai auth bootstrap-ceo` and open the printed invite URL to create the first admin.
