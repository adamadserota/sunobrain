import { PresetCards } from "./PresetCards";
import type { GenerateStep } from "../types";

interface OneshotPanelProps {
    input: string;
    step: GenerateStep;
    loading: boolean;
    error: string | null;
    onInputChange: (value: string) => void;
    onGenerate: () => void;
    onCancel: () => void;
    onReset: () => void;
}

export function OneshotPanel({
    input,
    step,
    loading,
    error,
    onInputChange,
    onGenerate,
    onCancel,
    onReset,
}: OneshotPanelProps) {
    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            {!input.trim() && step !== "complete" && <PresetCards disabled={loading} onSelect={onInputChange} />}
            <textarea
                className="input-osint flex-1 min-h-[200px] resize-y leading-relaxed text-sm"
                title="Drag bottom-right corner to resize"
                placeholder={
                    "Enter anything — a theme, lyrics, a URL, a single word, a concept...\n\n" +
                    "e.g., A melancholic yet hopeful song about leaving your hometown, " +
                    "with imagery of autumn leaves and empty train stations..."
                }
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                disabled={loading}
            />
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
                {step === "complete" && !loading && !error && (
                    <div className="px-4 py-3 rounded-xl border border-intel-primary-900/50 bg-intel-primary-950/20 text-intel-primary-300 text-sm">
                        Generation complete. Edit inputs and Regenerate, or start a New Song.
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
                ) : step === "complete" ? (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onReset}
                            className="btn-ghost flex-1"
                        >
                            New Song
                        </button>
                        <button
                            type="button"
                            onClick={onGenerate}
                            disabled={!input.trim()}
                            className="btn-primary flex-1"
                        >
                            Regenerate
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={!input.trim()}
                        className="btn-primary w-full"
                    >
                        Generate
                    </button>
                )}
                {!loading && step !== "complete" && input.trim() !== "" && (
                    <button
                        type="button"
                        onClick={() => onInputChange("")}
                        className="btn-ghost w-full"
                    >
                        Clear & Back to Presets
                    </button>
                )}
            </div>
        </div>
    );
}
