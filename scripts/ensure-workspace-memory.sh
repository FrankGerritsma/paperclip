#!/usr/bin/env bash
# Ensure agent workspace memory layout exists so MEMORY.md is findable at canonical
# paths and at .claude/projects/... paths used by some clients.
#
# Fixes: ReadErrored "File does not exist" for MEMORY.md when the client uses
# a path like []/.claude/projects/-paperclip-instances-default-workspaces-<id>/memory/MEMORY.md
# with an unsubstituted root ([]) or resolves that path relative to the workspace cwd.
#
# Usage:
#   ./scripts/ensure-workspace-memory.sh              # fix all workspaces under instance
#   ./scripts/ensure-workspace-memory.sh <workspace-id> # fix one workspace
#
# Respects: PAPERCLIP_HOME, PAPERCLIP_INSTANCE_ID

set -euo pipefail

expand_home() {
  local v="$1"
  if [[ "$v" == "~" ]]; then
    echo "$HOME"
  elif [[ "$v" == ~/* ]]; then
    echo "${HOME}/${v:2}"
  else
    echo "$v"
  fi
}

PAPERCLIP_HOME="${PAPERCLIP_HOME:-$HOME/.paperclip}"
PAPERCLIP_INSTANCE_ID="${PAPERCLIP_INSTANCE_ID:-default}"
INSTANCE_ROOT="$(cd "$(expand_home "$PAPERCLIP_HOME")" && pwd)/instances/$PAPERCLIP_INSTANCE_ID"
WORKSPACES_DIR="$INSTANCE_ROOT/workspaces"

if [[ ! -d "$WORKSPACES_DIR" ]]; then
  mkdir -p "$WORKSPACES_DIR"
fi

ensure_one() {
  local workspace_dir="$1"
  local workspace_id
  workspace_id="$(basename "$workspace_dir")"

  # Canonical layout (para-memory-files: $AGENT_HOME/MEMORY.md and $AGENT_HOME/memory/)
  [[ -f "$workspace_dir/MEMORY.md" ]] || touch "$workspace_dir/MEMORY.md"
  mkdir -p "$workspace_dir/memory"

  # Layout some clients use when resolving under workspace cwd:
  # .claude/projects/-<instance-slug>-workspaces-<id>/memory/MEMORY.md
  local slug="-paperclip-instances-${PAPERCLIP_INSTANCE_ID}-workspaces-${workspace_id}"
  local claude_memory_dir="$workspace_dir/.claude/projects/${slug}/memory"
  mkdir -p "$claude_memory_dir"
  local link="$claude_memory_dir/MEMORY.md"
  if [[ ! -e "$link" ]]; then
    ln -s "../../../../MEMORY.md" "$link"
  fi
}

if [[ -n "${1:-}" ]]; then
  target="$WORKSPACES_DIR/$1"
  if [[ ! -d "$target" ]]; then
    mkdir -p "$target"
  fi
  ensure_one "$target"
else
  for d in "$WORKSPACES_DIR"/*; do
    [[ -d "$d" ]] || continue
    ensure_one "$d"
  done
fi
