import { useEffect, useRef } from "react";
import { History, Trash2, X } from "lucide-react";
import type { HistoryEntry } from "../hooks/useSongHistory";

interface HistoryDrawerProps {
    open: boolean;
    history: HistoryEntry[];
    activeId: string | null;
    onClose: () => void;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function HistoryDrawer({
    open,
    history,
    activeId,
    onClose,
    onSelect,
    onDelete,
    onClear,
}: HistoryDrawerProps) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;
        previouslyFocused.current = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !panelRef.current) return;
            const focusables = panelRef.current.querySelectorAll<HTMLElement>(
                'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
            );
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (!first || !last) return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("keydown", handleKey);
            previouslyFocused.current?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-end bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-drawer-title"
                className="card-osint w-[400px] max-h-[90vh] m-4 flex flex-col shadow-2xl rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-border">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-intel-primary-400" />
                        <h2
                            id="history-drawer-title"
                            className="text-sm font-bold uppercase tracking-widest text-intel-primary-400"
                        >
                            History
                        </h2>
                        <span className="text-xs text-slate-500 font-semibold">
                            {history.length}/10
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {history.length > 0 && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="text-xs text-slate-400 hover:text-red-400 uppercase tracking-wider font-semibold transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="h-7 w-7 rounded-full border border-obsidian-border text-slate-400 flex items-center justify-center hover:border-intel-primary-500 hover:text-intel-primary-400 transition-all focus:outline-none focus:ring-2 focus:ring-intel-primary-500/60"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="h-20 w-20 rounded-full border border-obsidian-border bg-obsidian-raised/60 flex items-center justify-center mb-4">
                                <History size={40} className="text-intel-primary-500/70" />
                            </div>
                            <p className="text-sm font-semibold text-slate-300">No songs yet</p>
                            <p className="text-xs text-slate-500 mt-2 max-w-[240px]">
                                Your first generated song will be saved here — up to 10 recent tracks.
                            </p>
                        </div>
                    ) : (
                        <ul className="flex flex-col">
                            {history.map((entry) => {
                                const isActive = entry.id === activeId;
                                return (
                                    <li
                                        key={entry.id}
                                        className={`group border-b border-obsidian-border last:border-b-0 transition-colors ${
                                            isActive
                                                ? "bg-intel-primary-950/40"
                                                : "hover:bg-obsidian-raised/50"
                                        }`}
                                    >
                                        <div className="flex items-start gap-2 px-5 py-3">
                                            <button
                                                type="button"
                                                onClick={() => onSelect(entry.id)}
                                                className="flex-1 text-left min-w-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isActive && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-intel-primary-400 shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                                                    )}
                                                    <span
                                                        className={`text-sm font-semibold truncate ${
                                                            isActive
                                                                ? "text-intel-primary-300"
                                                                : "text-slate-200"
                                                        }`}
                                                    >
                                                        {entry.title}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {formatDate(entry.createdAt)}
                                                </p>
                                                {entry.result.styles && (
                                                    <p className="text-xs text-slate-400 mt-1 truncate">
                                                        {entry.result.styles.slice(0, 80)}
                                                    </p>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(entry.id);
                                                }}
                                                aria-label="Delete"
                                                className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-full text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
