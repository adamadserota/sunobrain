import { useState } from "react";
import { FlowToggle } from "./FlowToggle";
import { BuilderSection } from "./BuilderSection";
import { GenreSelector } from "./GenreSelector";
import { SavedStylesDrawer } from "./SavedStylesDrawer";
import { AutoTextarea } from "./AutoTextarea";
import type { BuilderInputs, FlowType, GenerateStep, SavedStyle } from "../types";

type SectionKey = "inspiration" | "genres" | "styleInfluences" | "lyricInput" | "exclusions";

interface BuilderPanelProps {
    builderInputs: BuilderInputs;
    flow: FlowType;
    step: GenerateStep;
    draft: string;
    loading: boolean;
    error: string | null;
    savedStyles: SavedStyle[];
    onBuilderChange: <K extends keyof BuilderInputs>(field: K, value: BuilderInputs[K]) => void;
    onFlowChange: (flow: FlowType) => void;
    onDraftChange: (value: string) => void;
    onGenerate: () => void;
    onOptimize: () => void;
    onCancel: () => void;
    onReset: () => void;
    onInjectStyle: (styleText: string) => void;
    onRenameStyle: (id: string, newName: string) => string | null;
    onDeleteStyle: (id: string) => void;
}

function hasContent(inputs: BuilderInputs): boolean {
    return (
        inputs.inspiration.trim() !== "" ||
        inputs.genres.length > 0 ||
        inputs.styleInfluences.trim() !== "" ||
        inputs.lyricInput.trim() !== "" ||
        inputs.exclusions.trim() !== ""
    );
}

const textareaClass =
    "input-osint min-h-[80px] text-sm leading-relaxed resize-y";

export function BuilderPanel({
    builderInputs,
    flow,
    step,
    draft,
    loading,
    error,
    savedStyles,
    onBuilderChange,
    onFlowChange,
    onDraftChange,
    onGenerate,
    onOptimize,
    onCancel,
    onReset,
    onInjectStyle,
    onRenameStyle,
    onDeleteStyle,
}: BuilderPanelProps) {
    const [collapsedSections, setCollapsedSections] = useState<Set<SectionKey>>(() => new Set());
    const isExpanded = (key: SectionKey) => !collapsedSections.has(key);
    const toggleSection = (key: SectionKey) =>
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    const filled: Record<SectionKey, boolean> = {
        inspiration: builderInputs.inspiration.trim() !== "",
        genres: builderInputs.genres.length > 0,
        styleInfluences: builderInputs.styleInfluences.trim() !== "",
        lyricInput: builderInputs.lyricInput.trim() !== "",
        exclusions: builderInputs.exclusions.trim() !== "",
    };

    if (step === "complete") {
        return (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
                <div className="p-4 rounded-xl border border-intel-primary-900/50 bg-intel-primary-950/20 text-intel-primary-300 text-sm">
                    Generation complete. Copy the outputs on the right and paste into Suno v5.5.
                </div>
                <div className="sticky bottom-0 -mx-4 -mb-4 px-4 py-4 bg-obsidian-900 border-t border-obsidian-border flex flex-col gap-2 z-10">
                    <button type="button" onClick={onReset} className="btn-ghost w-full">
                        New Song
                    </button>
                </div>
            </div>
        );
    }

    if (step === "draft_review") {
        return (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
                <span className="label-osint">Edit Your Draft</span>
                <textarea
                    className="input-osint flex-1 min-h-[200px] resize-none text-sm leading-relaxed"
                    value={draft}
                    onChange={(e) => onDraftChange(e.target.value)}
                    disabled={loading}
                />
                <div className="sticky bottom-0 -mx-4 -mb-4 px-4 py-4 bg-obsidian-900 border-t border-obsidian-border flex flex-col gap-2 z-10">
                    {loading && (
                        <div className="px-4 py-3 rounded-xl border border-intel-primary-900/50 bg-intel-primary-950/20 text-intel-primary-300 text-sm animate-pulse">
                            Optimizing...
                        </div>
                    )}
                    {error && (
                        <div className="px-4 py-3 rounded-xl border border-rose-800/60 bg-rose-950/30 text-rose-300 text-sm">
                            {error}
                        </div>
                    )}
                    {loading ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-ghost w-full border-rose-800/60 text-rose-300 hover:bg-rose-950/30"
                        >
                            Stop Optimization
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onOptimize}
                            disabled={!draft.trim()}
                            className="btn-primary w-full"
                        >
                            Optimize for Suno
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onReset}
                        disabled={loading}
                        className="btn-ghost w-full"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex flex-col gap-2">
                <span className="label-osint">Generation Flow</span>
                <FlowToggle flow={flow} onChange={onFlowChange} />
            </div>

            <SavedStylesDrawer
                savedStyles={savedStyles}
                onInject={onInjectStyle}
                onRename={onRenameStyle}
                onDelete={onDeleteStyle}
            />

            <BuilderSection
                label="General Inspiration"
                helpText="Mood, vibe, concept or theme — influences all outputs"
                isFilled={filled.inspiration}
                expanded={isExpanded("inspiration")}
                onToggle={() => toggleSection("inspiration")}
            >
                <AutoTextarea
                    className={textareaClass}
                    placeholder="Describe the vibe, mood, concept, or theme..."
                    value={builderInputs.inspiration}
                    onChange={(e) => onBuilderChange("inspiration", e.target.value)}
                    disabled={loading}
                />
            </BuilderSection>

            <BuilderSection
                label="Style Selector"
                helpText="Select genres to influence the style output — multi-select for fusion"
                isFilled={filled.genres}
                expanded={isExpanded("genres")}
                onToggle={() => toggleSection("genres")}
            >
                <GenreSelector
                    selected={builderInputs.genres}
                    onChange={(genres) => onBuilderChange("genres", genres)}
                    disabled={loading}
                />
            </BuilderSection>

            <BuilderSection
                label="Style Influences"
                helpText="Additional style details — vocal type, BPM, instruments, artist references, production preferences"
                isFilled={filled.styleInfluences}
                expanded={isExpanded("styleInfluences")}
                onToggle={() => toggleSection("styleInfluences")}
            >
                <AutoTextarea
                    className={textareaClass}
                    placeholder="e.g., male vocals, 120 BPM, analog synths, reverb-heavy, lo-fi warmth..."
                    value={builderInputs.styleInfluences}
                    onChange={(e) => onBuilderChange("styleInfluences", e.target.value)}
                    disabled={loading}
                />
            </BuilderSection>

            <BuilderSection
                label="Lyric Input"
                helpText="Existing lyrics or ideas — only affects lyrics output, not style"
                isFilled={filled.lyricInput}
                expanded={isExpanded("lyricInput")}
                onToggle={() => toggleSection("lyricInput")}
            >
                <AutoTextarea
                    className={`${textareaClass} min-h-[120px]`}
                    placeholder={"Paste existing lyrics or lyric ideas...\n\nVerse 1:\nWalking through the city lights..."}
                    value={builderInputs.lyricInput}
                    onChange={(e) => onBuilderChange("lyricInput", e.target.value)}
                    disabled={loading}
                />
            </BuilderSection>

            <BuilderSection
                label="Exclusions"
                helpText="Things to avoid — style elements, words, or vocal types to exclude"
                isFilled={filled.exclusions}
                expanded={isExpanded("exclusions")}
                onToggle={() => toggleSection("exclusions")}
            >
                <AutoTextarea
                    className={textareaClass}
                    placeholder="e.g., no female voices, no autotune, no trap beats, no profanity..."
                    value={builderInputs.exclusions}
                    onChange={(e) => onBuilderChange("exclusions", e.target.value)}
                    disabled={loading}
                />
            </BuilderSection>

            <div className="sticky bottom-0 -mx-4 -mb-4 px-4 py-4 bg-obsidian-900 border-t border-obsidian-border flex flex-col gap-2 z-10">
                {loading && (
                    <div className="px-4 py-3 rounded-xl border border-intel-primary-900/50 bg-intel-primary-950/20 text-intel-primary-300 text-sm animate-pulse">
                        Generating...
                    </div>
                )}
                {error && (
                    <div className="px-4 py-3 rounded-xl border border-rose-800/60 bg-rose-950/30 text-rose-300 text-sm">
                        {error}
                    </div>
                )}
                {loading ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-ghost w-full border-rose-800/60 text-rose-300 hover:bg-rose-950/30"
                    >
                        Stop Generation
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={!hasContent(builderInputs)}
                        className="btn-primary w-full"
                    >
                        Generate
                    </button>
                )}
            </div>
        </div>
    );
}
