import { TopModeToggle } from "./TopModeToggle";
import { OneshotPanel } from "./OneshotPanel";
import { BuilderPanel } from "./BuilderPanel";
import type { TopMode, FlowType, GenerateStep, BuilderInputs, SavedStyle } from "../types";

interface InputPanelProps {
    topMode: TopMode;
    flow: FlowType;
    step: GenerateStep;
    input: string;
    builderInputs: BuilderInputs;
    draft: string;
    loading: boolean;
    error: string | null;
    savedStyles: SavedStyle[];
    onTopModeChange: (mode: TopMode) => void;
    onFlowChange: (flow: FlowType) => void;
    onInputChange: (value: string) => void;
    onBuilderChange: <K extends keyof BuilderInputs>(field: K, value: BuilderInputs[K]) => void;
    onDraftChange: (value: string) => void;
    onGenerate: () => void;
    onOptimize: () => void;
    onCancel: () => void;
    onReset: () => void;
    onInjectStyle: (styleText: string) => void;
    onRenameStyle: (id: string, newName: string) => string | null;
    onDeleteStyle: (id: string) => void;
}

export function InputPanel({
    topMode,
    flow,
    step,
    input,
    builderInputs,
    draft,
    loading,
    error,
    savedStyles,
    onTopModeChange,
    onFlowChange,
    onInputChange,
    onBuilderChange,
    onDraftChange,
    onGenerate,
    onOptimize,
    onCancel,
    onReset,
    onInjectStyle,
    onRenameStyle,
    onDeleteStyle,
}: InputPanelProps) {
    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-auto">
            <TopModeToggle topMode={topMode} onChange={onTopModeChange} />

            {topMode === "oneshot" ? (
                <OneshotPanel
                    input={input}
                    step={step}
                    loading={loading}
                    error={error}
                    onInputChange={onInputChange}
                    onGenerate={onGenerate}
                    onCancel={onCancel}
                    onReset={onReset}
                />
            ) : (
                <BuilderPanel
                    builderInputs={builderInputs}
                    flow={flow}
                    step={step}
                    draft={draft}
                    loading={loading}
                    error={error}
                    savedStyles={savedStyles}
                    onBuilderChange={onBuilderChange}
                    onFlowChange={onFlowChange}
                    onDraftChange={onDraftChange}
                    onGenerate={onGenerate}
                    onOptimize={onOptimize}
                    onCancel={onCancel}
                    onReset={onReset}
                    onInjectStyle={onInjectStyle}
                    onRenameStyle={onRenameStyle}
                    onDeleteStyle={onDeleteStyle}
                />
            )}
        </div>
    );
}
