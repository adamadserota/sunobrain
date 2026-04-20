import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Contrast, Check } from "lucide-react";
import { THEMES, type Theme } from "../hooks/useTheme";

interface ThemeSelectorProps {
    theme: Theme;
    onChange: (theme: Theme) => void;
}

const ICON_BY_THEME: Record<Theme, typeof Sun> = {
    dark: Moon,
    light: Sun,
    a11y: Contrast,
};

export function ThemeSelector({ theme, onChange }: ThemeSelectorProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const CurrentIcon = ICON_BY_THEME[theme];
    const current = THEMES.find((t) => t.id === theme);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("mousedown", handleClick);
        window.addEventListener("keydown", handleKey);
        return () => {
            window.removeEventListener("mousedown", handleClick);
            window.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="h-9 w-9 rounded-full border border-obsidian-border text-slate-400 flex items-center justify-center transition-all duration-200 hover:border-intel-primary-500 hover:text-intel-primary-400 hover:bg-intel-primary-950/30 focus:outline-none focus:ring-2 focus:ring-intel-primary-500/60"
                aria-label={`Theme: ${current?.label ?? theme}. Click to change`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <CurrentIcon size={16} />
            </button>
            {open && (
                <div
                    role="listbox"
                    aria-label="Select theme"
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-obsidian-border bg-obsidian-surface shadow-xl shadow-black/40 backdrop-blur-xl z-50 overflow-hidden"
                >
                    {THEMES.map((opt) => {
                        const Icon = ICON_BY_THEME[opt.id];
                        const active = opt.id === theme;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                    onChange(opt.id);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                    active
                                        ? "bg-intel-primary-950/50 text-intel-primary-400"
                                        : "text-slate-300 hover:bg-obsidian-raised hover:text-intel-primary-400"
                                }`}
                            >
                                <Icon size={16} className="shrink-0" />
                                <span className="flex-1 flex flex-col">
                                    <span className="text-xs font-semibold uppercase tracking-wider">
                                        {opt.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 tracking-wide">
                                        {opt.hint}
                                    </span>
                                </span>
                                {active && <Check size={14} className="shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
