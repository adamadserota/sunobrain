import type { ReactNode } from "react";

interface BuilderSectionProps {
    label: string;
    helpText?: string;
    isFilled: boolean;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
}

export function BuilderSection({
    label,
    helpText,
    isFilled,
    expanded,
    onToggle,
    children,
}: BuilderSectionProps) {
    return (
        <div className="flex flex-col rounded-xl border border-obsidian-border bg-obsidian-surface/80 transition-colors duration-200 hover:border-obsidian-muted">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="flex items-center justify-between w-full text-left px-3 py-2.5 bg-transparent border-none cursor-pointer hover:bg-obsidian-raised/50 transition-colors"
            >
                <span className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                        aria-hidden
                        className={
                            "w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200 " +
                            (isFilled
                                ? "bg-intel-primary-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                                : "bg-transparent border border-obsidian-muted")
                        }
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
                        {label}
                    </span>
                </span>
                <span
                    aria-hidden
                    className={
                        "text-[10px] flex-shrink-0 transition-transform duration-200 " +
                        (expanded ? "rotate-90 text-intel-primary-400" : "text-slate-500")
                    }
                >
                    ▶
                </span>
            </button>
            {expanded && (
                <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5">
                    {helpText && (
                        <span className="text-[11px] leading-snug text-slate-400">{helpText}</span>
                    )}
                    {children}
                </div>
            )}
        </div>
    );
}
