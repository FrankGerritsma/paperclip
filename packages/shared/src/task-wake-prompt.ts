/** Context key set on run snapshot when a non-timer wake includes issue task text. */
export const PAPERCLIP_CURRENT_TASK_MARKDOWN_KEY = "paperclipCurrentTaskMarkdown" as const;

/** Max chars of issue description embedded in the prompt (rest truncated). */
export const PAPERCLIP_CURRENT_TASK_DESCRIPTION_MAX_CHARS = 16_384;

export function isHeartbeatTimerWake(
  invocationSource: string,
  wakeReason: string | undefined,
): boolean {
  if (invocationSource === "timer") return true;
  if (wakeReason === "heartbeat_timer") return true;
  return false;
}

/**
 * When true, executeRun should set {@link PAPERCLIP_CURRENT_TASK_MARKDOWN_KEY} from the issue row.
 * Timer heartbeats are excluded so standing instructions dominate on interval ticks.
 */
export function shouldInjectPaperclipCurrentTaskMarkdown(
  issueId: string | undefined | null,
  invocationSource: string,
  wakeReason: string | undefined,
): boolean {
  const id = typeof issueId === "string" ? issueId.trim() : "";
  if (!id) return false;
  if (isHeartbeatTimerWake(invocationSource, wakeReason)) return false;
  return true;
}

export function buildPaperclipCurrentTaskMarkdown(input: {
  identifier: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  maxDescriptionChars?: number;
}): string {
  const max = input.maxDescriptionChars ?? PAPERCLIP_CURRENT_TASK_DESCRIPTION_MAX_CHARS;
  const id = (input.identifier ?? "").trim() || "(no id)";
  const title = (input.title ?? "").trim() || "(no title)";
  let body = (input.description ?? "").trim();
  let truncated = false;
  if (body.length > max) {
    body = body.slice(0, max);
    truncated = true;
  }
  const lines: string[] = [
    "## CURRENT TASK",
    "",
    "This run was triggered by task activity on the issue below (not a passive timer heartbeat). **Prioritize completing the deliverables in the description before** your usual standing instructions or routine status checks.",
    "",
    `**Issue:** ${id} — ${title}`,
    "",
    "### Description",
  ];
  lines.push(
    body.length > 0
      ? body
      : "_(No description on file — use tools to load the full issue or ask for clarification.)_",
  );
  if (truncated) {
    lines.push("", "_[Description truncated for length.]_");
  }
  lines.push(
    "",
    "### Execution protocol",
    "1. Satisfy the task requirements above.",
    "2. Comment on the issue with what you did and any blockers.",
  );
  return lines.join("\n");
}
