import type { TopMode } from "../types";

interface TopModeToggleProps {
    topMode: TopMode;
    onChange: (mode: TopMode) => void;
}

function tabClass(active: boolean): string {
    const base =
        "flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-200";
    return active
        ? `${base} bg-intel-primary-500 text-obsidian shadow shadow-intel-primary/20`
        : `${base} text-slate-400 hover:text-slate-200`;
}

export function TopModeToggle({ topMode, onChange }: TopModeToggleProps) {
    return (
        <div
            role="tablist"
            aria-label="Generation mode"
            className="flex rounded-full overflow-hidden border border-obsidian-border p-1 bg-obsidian-surface gap-1"
        >
            <button
                type="button"
                role="tab"
                aria-selected={topMode === "oneshot"}
                aria-pressed={topMode === "oneshot"}
                onClick={() => onChange("oneshot")}
                className={tabClass(topMode === "oneshot")}
            >
                One-shot
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={topMode === "builder"}
                aria-pressed={topMode === "builder"}
                onClick={() => onChange("builder")}
                className={tabClass(topMode === "builder")}
            >
                Builder
            </button>
        </div>
    );
}
