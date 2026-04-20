import { useState, useCallback, useRef, useEffect } from "react";
import { Settings, History, Plus } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { ThemeSelector } from "./components/ThemeSelector";
import { useGenerate } from "./hooks/useGenerate";
import { useSavedStyles } from "./hooks/useSavedStyles";
import { useSongHistory } from "./hooks/useSongHistory";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./hooks/useTheme";
import type { Provider, RefreshSection } from "./types";
import { DEFAULT_MODEL } from "./types";

const MIN_PANEL_WIDTH = 260;
const DEFAULT_PANEL_WIDTH = 420;
const COLLAPSED_WIDTH = 40;

export function App() {
    const [provider, setProvider] = useLocalStorage<Provider>("sunobrain-provider", "gemini");
    const [geminiModel, setGeminiModel] = useLocalStorage(
        "sunobrain-gemini-model",
        DEFAULT_MODEL.gemini,
    );
    const [deepseekModel, setDeepseekModel] = useLocalStorage(
        "sunobrain-deepseek-model",
        DEFAULT_MODEL.deepseek,
    );

    const activeModel = provider === "deepseek" ? deepseekModel : geminiModel;
    const setActiveModel = provider === "deepseek" ? setDeepseekModel : setGeminiModel;

    const [theme, setTheme] = useTheme();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [panelWidth, setPanelWidth] = useLocalStorage("sunobrain-panel-width", DEFAULT_PANEL_WIDTH);
    const [collapsed, setCollapsed] = useState(false);
    const dragging = useRef(false);

    const gen = useGenerate();
    const { savedStyles, saveStyle, renameStyle, deleteStyle } = useSavedStyles();
    const { history, addEntry, updateEntry, deleteEntry, clearHistory } = useSongHistory();

    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const lastSavedResult = useRef<typeof gen.result>(null);

    useEffect(() => {
        if (
            gen.result &&
            gen.step === "complete" &&
            !gen.loading &&
            gen.result !== lastSavedResult.current &&
            gen.result.lyrics
        ) {
            lastSavedResult.current = gen.result;
            void addEntry(gen.result).then((id) => {
                if (id) setActiveHistoryId(id);
            });
        }
    }, [gen.result, gen.step, gen.loading, addEntry]);

    const handleGenerate = () => {
        gen.generate("", activeModel, provider);
    };

    const handleOptimize = () => {
        gen.optimize("", activeModel, provider);
    };

    const handleInjectStyle = useCallback(
        (styleText: string) => {
            gen.updateBuilderField("styleInfluences", styleText);
        },
        [gen.updateBuilderField],
    );

    const pendingPatchRef = useRef<Parameters<typeof gen.updateResult>[0] | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleUpdateResult = useCallback(
        (patch: Parameters<typeof gen.updateResult>[0]) => {
            gen.updateResult(patch);
            if (!activeHistoryId) return;
            pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                const merged = pendingPatchRef.current;
                pendingPatchRef.current = null;
                saveTimerRef.current = null;
                if (merged) updateEntry(activeHistoryId, merged);
            }, 600);
        },
        [gen.updateResult, activeHistoryId, updateEntry],
    );

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const handleSelectHistory = useCallback(
        (id: string) => {
            const entry = history.find((e) => e.id === id);
            if (!entry) return;
            lastSavedResult.current = entry.result;
            gen.loadResult(entry.result);
            setActiveHistoryId(id);
            setHistoryOpen(false);
        },
        [history, gen.loadResult],
    );

    const handleDeleteHistory = useCallback(
        (id: string) => {
            deleteEntry(id);
            if (activeHistoryId === id) {
                setActiveHistoryId(null);
            }
        },
        [deleteEntry, activeHistoryId],
    );

    const handleClearHistory = useCallback(() => {
        clearHistory();
        setActiveHistoryId(null);
    }, [clearHistory]);

    const handleRefreshSection = useCallback(
        (section: RefreshSection, currentTitle: string) =>
            gen.refreshSection(section, currentTitle, handleUpdateResult, activeModel, provider),
        [gen.refreshSection, handleUpdateResult, activeModel, provider],
    );

    const handleNewSong = useCallback(() => {
        lastSavedResult.current = null;
        setActiveHistoryId(null);
        gen.reset();
    }, [gen.reset]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            dragging.current = true;

            const startX = e.clientX;
            const startWidth = panelWidth;

            const onMouseMove = (ev: MouseEvent) => {
                if (!dragging.current) return;
                const delta = ev.clientX - startX;
                const newWidth = Math.max(MIN_PANEL_WIDTH, startWidth + delta);
                setPanelWidth(newWidth);
            };

            const onMouseUp = () => {
                dragging.current = false;
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
            };

            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        },
        [panelWidth, setPanelWidth],
    );

    const handleSaveStyle = gen.topMode === "builder" ? saveStyle : undefined;

    const hasOutput = gen.step === "complete" && gen.result !== null;
    const showSplit = hasOutput || gen.loading;

    return (
        <ErrorBoundary>
            <div className="flex flex-col h-screen overflow-hidden bg-obsidian-900">
                <header className="relative z-40 flex justify-between items-center px-6 py-3 border-b border-obsidian-border bg-obsidian-surface/80 backdrop-blur-xl">
                    <div className="flex items-baseline gap-3">
                        <span className="font-display text-2xl tracking-wider text-intel-primary-400 drop-shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                            SUNOBRAIN
                        </span>
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            Suno v5.5 Production Studio
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasOutput && (
                            <button
                                type="button"
                                onClick={handleNewSong}
                                className="h-9 px-3 rounded-full border border-obsidian-border text-slate-400 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:border-intel-primary-500 hover:text-intel-primary-400 hover:bg-intel-primary-950/30"
                                aria-label="New song"
                            >
                                <Plus size={14} />
                                New
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setHistoryOpen(true)}
                            className="relative h-9 w-9 rounded-full border border-obsidian-border text-slate-400 flex items-center justify-center transition-all duration-200 hover:border-intel-primary-500 hover:text-intel-primary-400 hover:bg-intel-primary-950/30"
                            aria-label="History"
                        >
                            <History size={16} />
                            {history.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-intel-primary-500 text-obsidian text-[10px] font-bold flex items-center justify-center">
                                    {history.length}
                                </span>
                            )}
                        </button>
                        <ThemeSelector theme={theme} onChange={setTheme} />
                        <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            className="h-9 w-9 rounded-full border border-obsidian-border text-slate-400 flex items-center justify-center transition-all duration-200 hover:border-intel-primary-500 hover:text-intel-primary-400 hover:bg-intel-primary-950/30"
                            aria-label="Settings"
                        >
                            <Settings size={16} />
                        </button>
                    </div>
                </header>

                <main className="flex flex-1 overflow-hidden min-h-0">
                    {showSplit ? (
                        <>
                            <div
                                className="relative overflow-hidden flex-shrink-0 transition-[width] duration-200 border-r border-obsidian-border bg-obsidian-900"
                                style={{ width: collapsed ? COLLAPSED_WIDTH : panelWidth }}
                            >
                                {collapsed ? (
                                    <div
                                        onClick={() => setCollapsed(false)}
                                        className="flex items-center justify-center h-full cursor-pointer hover:bg-obsidian-raised transition-colors"
                                    >
                                        <span className="[writing-mode:vertical-rl] text-xs font-bold tracking-widest uppercase text-intel-primary-500 select-none">
                                            Input Panel
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setCollapsed(true)}
                                            className="absolute top-2 right-3 z-[11] h-6 w-6 rounded-full bg-obsidian-raised border border-obsidian-border text-slate-400 flex items-center justify-center text-xs transition-all hover:border-intel-primary-500 hover:text-intel-primary-400"
                                            title="Collapse panel"
                                        >
                                            ◀
                                        </button>
                                        <InputPanel
                                            topMode={gen.topMode}
                                            flow={gen.flow}
                                            step={gen.step}
                                            input={gen.input}
                                            builderInputs={gen.builderInputs}
                                            draft={gen.draft}
                                            loading={gen.loading}
                                            error={gen.error}
                                            savedStyles={savedStyles}
                                            onTopModeChange={gen.setTopMode}
                                            onFlowChange={gen.setFlow}
                                            onInputChange={gen.setInput}
                                            onBuilderChange={gen.updateBuilderField}
                                            onDraftChange={gen.setDraft}
                                            onGenerate={handleGenerate}
                                            onOptimize={handleOptimize}
                                            onCancel={gen.cancel}
                                            onReset={gen.reset}
                                            onInjectStyle={handleInjectStyle}
                                            onRenameStyle={renameStyle}
                                            onDeleteStyle={deleteStyle}
                                        />
                                        <div
                                            onMouseDown={handleMouseDown}
                                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-obsidian-border z-10 transition-colors hover:bg-intel-primary-500 active:bg-intel-primary-500"
                                        />
                                    </>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden min-w-0 xiii-panel-enter">
                                <OutputPanel
                                    result={gen.result}
                                    loading={gen.loading}
                                    genres={gen.builderInputs.genres}
                                    onUpdateResult={handleUpdateResult}
                                    onSaveStyle={handleSaveStyle}
                                    onRefreshSection={handleRefreshSection}
                                    refreshing={gen.refreshing}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-3xl mx-auto w-full px-6 py-6">
                                <InputPanel
                                    topMode={gen.topMode}
                                    flow={gen.flow}
                                    step={gen.step}
                                    input={gen.input}
                                    builderInputs={gen.builderInputs}
                                    draft={gen.draft}
                                    loading={gen.loading}
                                    error={gen.error}
                                    savedStyles={savedStyles}
                                    onTopModeChange={gen.setTopMode}
                                    onFlowChange={gen.setFlow}
                                    onInputChange={gen.setInput}
                                    onBuilderChange={gen.updateBuilderField}
                                    onDraftChange={gen.setDraft}
                                    onGenerate={handleGenerate}
                                    onOptimize={handleOptimize}
                                    onCancel={gen.cancel}
                                    onReset={gen.reset}
                                    onInjectStyle={handleInjectStyle}
                                    onRenameStyle={renameStyle}
                                    onDeleteStyle={deleteStyle}
                                />
                            </div>
                        </div>
                    )}
                </main>

                {settingsOpen && (
                    <SettingsPanel
                        provider={provider}
                        model={activeModel}
                        onProviderChange={setProvider}
                        onModelChange={setActiveModel}
                        onClose={() => setSettingsOpen(false)}
                    />
                )}

                <HistoryDrawer
                    open={historyOpen}
                    history={history}
                    activeId={activeHistoryId}
                    onClose={() => setHistoryOpen(false)}
                    onSelect={handleSelectHistory}
                    onDelete={handleDeleteHistory}
                    onClear={handleClearHistory}
                />
            </div>
        </ErrorBoundary>
    );
}
