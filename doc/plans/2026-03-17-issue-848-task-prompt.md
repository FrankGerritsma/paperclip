# Issue #848: Task-triggered runs include issue description in prompt

## Problem

Agents woken by issue activity (`issue_commented`, assignment, etc.) often followed default heartbeat behavior because the **issue body was never in the model context**—only metadata like `wakeReason` and `issueId`. GitHub issue: [paperclipai/paperclip#848](https://github.com/paperclipai/paperclip/issues/848).

## Design

1. **Classification** (`packages/shared/src/task-wake-prompt.ts`): Treat as “heartbeat timer” and **skip** injection when `invocationSource === "timer"` **or** `wakeReason === "heartbeat_timer"`. Otherwise, if the run has a non-empty `issueId`, inject.
2. **Context enrichment** (`server/src/services/heartbeat.ts` `executeRun`): After loading the issue row (id, identifier, title, description), set `context.paperclipCurrentTaskMarkdown` via `buildPaperclipCurrentTaskMarkdown` when `shouldInjectPaperclipCurrentTaskMarkdown` is true; otherwise delete that key.
3. **Prompt assembly**: Adapters read the block with `readPaperclipCurrentTaskMarkdown(context)` from `@paperclipai/adapter-utils/server-utils` (key `paperclipCurrentTaskMarkdown`).
   - **claude / codex / cursor / gemini / opencode**: Inserted in `joinPromptSections` after bootstrap and session handoff, before env notes (where present) and the rendered heartbeat template.
   - **pi_local**: Prepended into the `--append-system-prompt` string (before role/instructions) so it behaves like system-level priority.
   - **openclaw_gateway**: Appended to the procedural `buildWakeText` body.

## Wake reasons (issue routes)

These set `issueId` / `wakeReason` from `server/src/routes/issues.ts` (non-exhaustive): `issue_assigned`, `issue_status_changed`, `issue_comment_mentioned`, `issue_checked_out`, `issue_reopened_via_comment`, `issue_commented`, `stale_checkout_run`. Other wakes (e.g. `approval_approved`) may still get injection if they carry `issueId` and are not timer-classified.

## Constants

| Name | Value / role |
|------|----------------|
| `PAPERCLIP_CURRENT_TASK_MARKDOWN_KEY` | `"paperclipCurrentTaskMarkdown"` |
| `PAPERCLIP_CURRENT_TASK_DESCRIPTION_MAX_CHARS` | 16384 |

## Truncation

Descriptions longer than the max are sliced and a “truncated” note is appended.

## Session resume

Injection happens per run in `executeRun` from the **current** issue row; it does not depend on session resume. Related gap: [#799](https://github.com/paperclipai/paperclip/issues/799) (triggering comment body on resumed sessions).

## Extending

- New non-timer issue wakes: ensure `issueId` is on `contextSnapshot`; no allowlist of `wakeReason` is required unless you need to exclude a path.
- New adapter: call `readPaperclipCurrentTaskMarkdown` and merge like existing locals or gateway.

## Verification

- `pnpm -r typecheck`, `pnpm test:run`, `pnpm build`
- Manual: comment on assigned issue whose **description** lists concrete deliverables; confirm transcript includes `## CURRENT TASK` and the description text.
