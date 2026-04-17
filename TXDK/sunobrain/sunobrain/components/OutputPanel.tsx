/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useCallback, useState } from "react";
import { SongTitle } from "./SongTitle";
import { LyricsOutput } from "./LyricsOutput";
import { StyleOutput } from "./StyleOutput";
import { ExcludeOutput } from "./ExcludeOutput";
import { AnalysisSection } from "./AnalysisSection";
import { PlainLyricsOutput } from "./PlainLyricsOutput";
import { AlbumCover } from "./AlbumCover";
import { LoadingAnimation } from "./LoadingAnimation";
import type { GenerateResponse, RefreshSection } from "../types";
import type { SaveStyleParams } from "../hooks/useSavedStyles";

function buildSunoBlock(result: GenerateResponse): string {
    const parts: string[] = [];
    if (result.styles.trim()) {
        parts.push(`=== STYLES ===\n${result.styles.trim()}`);
    }
    if (result.exclude_styles.trim()) {
        parts.push(`=== EXCLUDE STYLES ===\n${result.exclude_styles.trim()}`);
    }
    if (result.lyrics.trim()) {
        parts.push(`=== LYRICS ===\n${result.lyrics.trim()}`);
    }
    return parts.join("\n\n");
}

function extractSongTitle(lyrics: string): string {
    const match = lyrics.match(/\[Title:\s*(.+?)\]/i);
    return match?.[1]?.trim() || "UNTITLED";
}

const panelStyle = css({
    display: "flex",
    flexDirection: "column",
    gap: "var(--fui-spacing-3)",
    padding: "var(--fui-spacing-3)",
    height: "100%",
    overflow: "auto",
});

const emptyStyle = css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "var(--fui-spacing-3)",
    color: "var(--fui-text-muted)",
    fontFamily: "var(--fui-font)",
    textAlign: "center",
    padding: "var(--fui-spacing-6)",
});

const emptyTitle = css({
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "var(--fui-primary-40)",
});

const emptyDesc = css({
    fontSize: "14px",
    lineHeight: 1.6,
    maxWidth: 360,
});

const headerBarStyle = css({
    position: "sticky",
    top: "calc(-1 * var(--fui-spacing-3))",
    marginLeft: "calc(-1 * var(--fui-spacing-3))",
    marginRight: "calc(-1 * var(--fui-spacing-3))",
    marginTop: "calc(-1 * var(--fui-spacing-3))",
    padding: "var(--fui-spacing-3)",
    background: "var(--fui-bg)",
    borderBottom: "1px solid var(--fui-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--fui-spacing-2)",
    zIndex: 5,
});

const headerLabelStyle = css({
    fontFamily: "var(--fui-font)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "var(--fui-text-muted)",
});

const copyAllButtonStyle = css({
    padding: "8px 14px",
    fontFamily: "var(--fui-font)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--fui-primary-100)",
    background: "var(--fui-primary-20)",
    color: "var(--fui-primary-100)",
    transition: "all 0.15s ease",
    "&:hover:not(:disabled)": {
        background: "var(--fui-primary-40)",
        boxShadow: "var(--fui-glow-primary)",
    },
});

const copiedButtonStyle = css({
    background: "var(--fui-primary-40)",
    boxShadow: "var(--fui-glow-primary)",
});

const toastStyle = css({
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 18px",
    background: "var(--fui-bg-section)",
    border: "1px solid var(--fui-primary-100)",
    color: "var(--fui-primary-100)",
    fontFamily: "var(--fui-font)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase",
    zIndex: 200,
    boxShadow: "var(--fui-glow-primary)",
    "@keyframes toastIn": {
        from: { opacity: 0, transform: "translate(-50%, 8px)" },
        to: { opacity: 1, transform: "translate(-50%, 0)" },
    },
    animation: "toastIn 0.2s ease",
});

interface OutputPanelProps {
    result: GenerateResponse | null;
    loading: boolean;
    genres?: string[];
    onUpdateResult?: (patch: Partial<GenerateResponse>) => void;
    onSaveStyle?: (params: SaveStyleParams) => string | null;
    onRefreshSection?: (section: RefreshSection, currentTitle: string) => Promise<void>;
    refreshing?: RefreshSection | null;
}

export function OutputPanel({
    result,
    loading,
    genres,
    onUpdateResult,
    onSaveStyle,
    onRefreshSection,
    refreshing,
}: OutputPanelProps) {
    const [copiedAll, setCopiedAll] = useState(false);

    const handleCopyAll = useCallback(async () => {
        if (!result) return;
        await navigator.clipboard.writeText(buildSunoBlock(result));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1800);
    }, [result]);

    // When the title is edited, update the [Title: ...] tag inside lyrics too
    const handleTitleChange = useCallback(
        (newTitle: string) => {
            if (!result || !onUpdateResult) return;
            const updatedLyrics = result.lyrics.replace(
                /\[Title:\s*(.+?)\]/i,
                `[Title: ${newTitle}]`,
            );
            onUpdateResult({ lyrics: updatedLyrics });
        },
        [result, onUpdateResult],
    );

    const handleLyricsChange = useCallback(
        (newLyrics: string) => onUpdateResult?.({ lyrics: newLyrics }),
        [onUpdateResult],
    );

    const handleStylesChange = useCallback(
        (newStyles: string) => onUpdateResult?.({ styles: newStyles }),
        [onUpdateResult],
    );

    const handleExcludeChange = useCallback(
        (newExclude: string) => onUpdateResult?.({ exclude_styles: newExclude }),
        [onUpdateResult],
    );

    if (loading) {
        return (
            <div css={panelStyle}>
                <LoadingAnimation />
            </div>
        );
    }

    if (!result) {
        return (
            <div css={panelStyle}>
                <div css={emptyStyle}>
                    <div css={emptyTitle}>SunoBrain</div>
                    <div css={emptyDesc}>
                        Paste lyrics or describe a theme, then hit Generate to produce
                        Suno v5.5-optimized output.
                    </div>
                </div>
            </div>
        );
    }

    const songTitle = extractSongTitle(result.lyrics);

    return (
        <div css={panelStyle}>
            <div css={headerBarStyle}>
                <span css={headerLabelStyle}>Generated</span>
                <button
                    css={[copyAllButtonStyle, copiedAll && copiedButtonStyle]}
                    onClick={handleCopyAll}
                    type="button"
                >
                    {copiedAll ? "\u2713 Copied" : "\u{1F4CB} Copy All for Suno"}
                </button>
            </div>
            {copiedAll && <div css={toastStyle}>Suno-ready block copied to clipboard</div>}
            <SongTitle
                value={songTitle}
                onChange={onUpdateResult ? handleTitleChange : undefined}
                onRefresh={onRefreshSection ? () => onRefreshSection("title", songTitle) : undefined}
                refreshing={refreshing === "title"}
            />
            <LyricsOutput
                value={result.lyrics}
                onChange={onUpdateResult ? handleLyricsChange : undefined}
                onRefresh={onRefreshSection ? () => onRefreshSection("lyrics", songTitle) : undefined}
                refreshing={refreshing === "lyrics"}
            />
            <StyleOutput
                value={result.styles}
                excludeStyles={result.exclude_styles}
                genres={genres}
                onChange={onUpdateResult ? handleStylesChange : undefined}
                onSaveStyle={onSaveStyle}
                onRefresh={onRefreshSection ? () => onRefreshSection("styles", songTitle) : undefined}
                refreshing={refreshing === "styles"}
            />
            <ExcludeOutput
                value={result.exclude_styles}
                onChange={onUpdateResult ? handleExcludeChange : undefined}
                onRefresh={onRefreshSection ? () => onRefreshSection("exclude", songTitle) : undefined}
                refreshing={refreshing === "exclude"}
            />
            <AnalysisSection analysis={result.analysis} />
            <PlainLyricsOutput value={result.plain_lyrics} />
            {result.plain_lyrics && (
                <AlbumCover
                    plainLyrics={result.plain_lyrics}
                    songTitle={songTitle}
                    styles={result.styles}
                />
            )}
        </div>
    );
}
