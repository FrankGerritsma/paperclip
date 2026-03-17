# Railway deploy (authenticated + public, S3, Postgres)

Date: 2026-03-16

## Summary

Deploy Paperclip on Railway with:

- **Mode**: authenticated + public (login required, internet-facing).
- **Database**: Railway PostgreSQL; set `DATABASE_URL=${{Postgres.DATABASE_URL}}` (use your Postgres service name).
- **Storage**: AWS S3; set `PAPERCLIP_STORAGE_PROVIDER=s3` and S3 bucket/region plus `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.

## Steps

1. **Code**: Pull latest from Git; run `pnpm -r typecheck`, `pnpm test:run`, `pnpm build` (see AGENTS.md).
2. **Railway**: New project → add PostgreSQL service → create app service from this repo (uses root Dockerfile via `railway.toml`).
3. **App service variables**: Set all required env vars (see table below). Reference Postgres: `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
4. **S3**: Create bucket and IAM user with S3 read/write; add credentials to Railway variables.
5. **Deploy**: Deploy app; open public URL; complete login and board-claim if the banner shows a claim URL.

## Required environment variables (app service)

| Variable | Example / note |
|----------|----------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `PAPERCLIP_DEPLOYMENT_MODE` | `authenticated` |
| `PAPERCLIP_DEPLOYMENT_EXPOSURE` | `public` |
| `PAPERCLIP_AUTH_PUBLIC_BASE_URL` | `https://your-app.up.railway.app` (HTTPS required) |
| `BETTER_AUTH_SECRET` | e.g. `openssl rand -base64 32` |
| `PAPERCLIP_STORAGE_PROVIDER` | `s3` |
| `PAPERCLIP_STORAGE_S3_BUCKET` | Your S3 bucket name |
| `PAPERCLIP_STORAGE_S3_REGION` | e.g. `us-east-1` |
| `AWS_ACCESS_KEY_ID` | IAM credentials for S3 |
| `AWS_SECRET_ACCESS_KEY` | IAM credentials for S3 |
| `PAPERCLIP_SECRETS_MASTER_KEY` | 32-byte key (base64/hex); generate once, store securely |
| `PORT` | `3100` (Railway often sets this) |

Optional: `PAPERCLIP_AUTH_DISABLE_SIGN_UP=true` for invite-only sign-up.

If you use a Railway-generated domain, `RAILWAY_STATIC_URL` is used as a fallback for the auth base URL; you can still set `PAPERCLIP_AUTH_PUBLIC_BASE_URL` for a custom domain.

## References

- Deployment overview: https://docs.paperclip.ing/deploy/overview
- Env reference: `.env.example` (Railway section)
- Deployment modes: `doc/DEPLOYMENT-MODES.md`
