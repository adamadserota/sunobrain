import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

const GENRES = [
    "Pop", "Rock", "Indie", "Alternative", "Hip-Hop",
    "R&B", "Soul", "Jazz", "Blues", "Country",
    "Folk", "Electronic", "House", "Techno", "Trance",
    "DnB", "Dubstep", "Ambient", "Classical", "Orchestral",
    "Metal", "Punk", "Reggae", "Latin", "Afrobeats",
    "K-Pop", "Lo-Fi", "Trap", "Funk", "Gospel",
];

interface GenreSelectorProps {
    selected: string[];
    onChange: (genres: string[]) => void;
    disabled?: boolean;
}

export function GenreSelector({ selected, onChange, disabled }: GenreSelectorProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const toggle = (genre: string) => {
        if (selected.includes(genre)) {
            onChange(selected.filter((g) => g !== genre));
        } else {
            onChange([...selected, genre]);
        }
    };

    const removeChip = (genre: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter((g) => g !== genre));
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => !disabled && setOpen((o) => !o)}
                disabled={disabled}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl border bg-obsidian-raised text-left
                    text-sm text-slate-100 transition-colors
                    flex items-center gap-2 flex-wrap
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${open
                        ? "border-intel-primary-500 ring-1 ring-intel-primary-500/40"
                        : "border-obsidian-border hover:border-intel-primary-500/60"}`}
            >
                {selected.length === 0 ? (
                    <span className="text-slate-500">Select genres…</span>
                ) : (
                    selected.map((genre) => (
                        <span
                            key={genre}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                                bg-intel-primary-950/60 border border-intel-primary-500/60 text-intel-primary-300"
                        >
                            {genre}
                            <span
                                role="button"
                                tabIndex={0}
                                aria-label={`Remove ${genre}`}
                                onClick={(e) => removeChip(genre, e)}
                                className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <X size={11} />
                            </span>
                        </span>
                    ))
                )}
                <ChevronDown
                    size={14}
                    className={`ml-auto text-slate-400 transition-transform duration-200 ${
                        open ? "rotate-180 text-intel-primary-400" : ""
                    }`}
                />
            </button>

            {open && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto
                    rounded-xl border border-intel-primary-500/40 bg-obsidian-surface shadow-2xl shadow-black/60">
                    {GENRES.map((genre) => {
                        const isSelected = selected.includes(genre);
                        return (
                            <button
                                type="button"
                                key={genre}
                                onClick={() => toggle(genre)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                                    ${isSelected
                                        ? "bg-intel-primary-950/40 text-intel-primary-300"
                                        : "text-slate-200 hover:bg-obsidian-raised"}`}
                            >
                                <span
                                    aria-hidden
                                    className={`h-4 w-4 rounded-sm border flex items-center justify-center transition-all
                                        ${isSelected
                                            ? "border-intel-primary-500 bg-intel-primary-500 text-obsidian"
                                            : "border-obsidian-muted bg-transparent"}`}
                                >
                                    {isSelected && <span className="text-[10px] font-black">✓</span>}
                                </span>
                                {genre}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
