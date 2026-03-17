import { describe, expect, it } from "vitest";
import {
  PAPERCLIP_CURRENT_TASK_MARKDOWN_KEY,
  buildPaperclipCurrentTaskMarkdown,
  isHeartbeatTimerWake,
  shouldInjectPaperclipCurrentTaskMarkdown,
} from "@paperclipai/shared";
import { readPaperclipCurrentTaskMarkdown } from "@paperclipai/adapter-utils/server-utils";

describe("task-wake-prompt", () => {
  it("isHeartbeatTimerWake for timer source or heartbeat_timer reason", () => {
    expect(isHeartbeatTimerWake("timer", undefined)).toBe(true);
    expect(isHeartbeatTimerWake("timer", "issue_commented")).toBe(true);
    expect(isHeartbeatTimerWake("automation", "heartbeat_timer")).toBe(true);
    expect(isHeartbeatTimerWake("automation", "issue_commented")).toBe(false);
    expect(isHeartbeatTimerWake("assignment", "issue_assigned")).toBe(false);
  });

  it("shouldInject only when issue id and not timer wake", () => {
    expect(shouldInjectPaperclipCurrentTaskMarkdown(null, "timer", undefined)).toBe(false);
    expect(shouldInjectPaperclipCurrentTaskMarkdown("  ", "automation", "x")).toBe(false);
    expect(shouldInjectPaperclipCurrentTaskMarkdown("i1", "timer", "issue_commented")).toBe(false);
    expect(shouldInjectPaperclipCurrentTaskMarkdown("i1", "automation", "issue_commented")).toBe(
      true,
    );
  });

  it("buildPaperclipCurrentTaskMarkdown includes title and description", () => {
    const md = buildPaperclipCurrentTaskMarkdown({
      identifier: "ACME-42",
      title: "Do the thing",
      description: "Create files a through z.",
    });
    expect(md).toContain("## CURRENT TASK");
    expect(md).toContain("ACME-42");
    expect(md).toContain("Do the thing");
    expect(md).toContain("Create files a through z.");
    expect(md).toContain("Execution protocol");
  });

  it("buildPaperclipCurrentTaskMarkdown truncates long description", () => {
    const long = "x".repeat(100);
    const md = buildPaperclipCurrentTaskMarkdown({
      identifier: "1",
      title: "t",
      description: long,
      maxDescriptionChars: 20,
    });
    expect(md).toContain("x".repeat(20));
    expect(md).toContain("truncated");
    expect(md).not.toContain("x".repeat(50));
  });

  it("readPaperclipCurrentTaskMarkdown reads context key", () => {
    expect(readPaperclipCurrentTaskMarkdown({})).toBeUndefined();
    expect(
      readPaperclipCurrentTaskMarkdown({
        [PAPERCLIP_CURRENT_TASK_MARKDOWN_KEY]: "  hello  ",
      }),
    ).toBe("hello");
  });
});
