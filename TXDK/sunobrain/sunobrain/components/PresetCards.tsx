import { Guitar, Headphones, Drum, Zap, Moon, Cloud, type LucideIcon } from "lucide-react";

interface Preset {
    label: string;
    prompt: string;
    icon: LucideIcon;
}

const PRESETS: Preset[] = [
    {
        label: "90s Alt-Rock",
        icon: Guitar,
        prompt:
            "A bittersweet breakup song in the style of 90s alternative rock — jangly guitars, melancholic male vocals, rainy city imagery, introspective lyrics about letting someone go.",
    },
    {
        label: "Lo-Fi",
        icon: Headphones,
        prompt:
            "Chill lo-fi hip-hop beat about late-night studying, warm vinyl crackle, muted piano, soft rain outside, sleepy and focused mood, barely-there vocals.",
    },
    {
        label: "Epic Orchestral",
        icon: Drum,
        prompt:
            "Epic cinematic orchestral piece — sweeping strings and brass, a hero's journey through stormy landscapes, choir swells, no lyrics (instrumental), building tension to triumphant climax.",
    },
    {
        label: "Hyperpop",
        icon: Zap,
        prompt:
            "High-energy hyperpop anthem with glitchy synths, pitched and layered vocals, distorted 808s, neon nightlife imagery, maximalist production, defiant and euphoric.",
    },
    {
        label: "Dark Synth",
        icon: Moon,
        prompt:
            "Moody dark synthwave track, pulsing arpeggios, deep analog bass, neon noir atmosphere, late-night highway driving, cold and cinematic, minimal vocals.",
    },
    {
        label: "Dream Pop",
        icon: Cloud,
        prompt:
            "Dreamy ethereal dream pop with reverb-drenched female vocals, chorus-laden guitars, shoegaze textures, floating and weightless, lyrics about memory and longing.",
    },
];

interface PresetCardsProps {
    disabled?: boolean;
    onSelect: (prompt: string) => void;
}

export function PresetCards({ disabled, onSelect }: PresetCardsProps) {
    return (
        <div className="flex flex-col gap-3">
            <span className="label-osint">Quick Start</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((p) => {
                    const Icon = p.icon;
                    return (
                        <button
                            key={p.label}
                            onClick={() => onSelect(p.prompt)}
                            disabled={disabled}
                            type="button"
                            title={p.prompt}
                            className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border border-obsidian-border bg-obsidian-raised/60
                                       text-slate-300 text-xs font-semibold uppercase tracking-wider
                                       transition-all duration-200
                                       hover:border-intel-primary-500 hover:text-intel-primary-400
                                       hover:bg-intel-primary-950/30
                                       disabled:opacity-40 disabled:cursor-not-allowed
                                       disabled:hover:border-obsidian-border disabled:hover:text-slate-300
                                       disabled:hover:bg-obsidian-raised/60"
                        >
                            <Icon size={20} strokeWidth={1.5} />
                            <span className="leading-tight text-center">{p.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
