/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState, useCallback } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { generateAlbumCover } from "../services/apiClient";
import { compositeAlbumCover } from "../services/coverCompositor";

const generateButtonStyle = css({
    padding: "8px 16px",
    fontFamily: "var(--fui-font)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--fui-primary-60)",
    background: "var(--fui-primary-10)",
    color: "var(--fui-primary-100)",
    transition: "all 0.15s ease",
    "&:hover:not(:disabled)": {
        background: "var(--fui-primary-20)",
        boxShadow: "var(--fui-glow-primary)",
    },
    "&:disabled": {
        opacity: 0.4,
        cursor: "not-allowed",
    },
});

const imageContainerStyle = css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
});

const imageStyle = css({
    maxWidth: "100%",
    maxHeight: 500,
    border: "1px solid var(--fui-border)",
});

const loadingStyle = css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--fui-spacing-5)",
    fontFamily: "var(--fui-font)",
    fontSize: "13px",
    color: "var(--fui-primary-80)",
    border: "1px solid var(--fui-primary-20)",
    background: "var(--fui-primary-5)",
    "@keyframes pulse": {
        "0%, 100%": { opacity: 0.4 },
        "50%": { opacity: 1 },
    },
    animation: "pulse 1.5s ease-in-out infinite",
});

const errorStyle = css({
    fontFamily: "var(--fui-font)",
    fontSize: "13px",
    color: "var(--fui-error-100)",
    padding: "var(--fui-spacing-2) var(--fui-spacing-3)",
    border: "1px solid var(--fui-error-100)",
    background: "rgba(255, 51, 51, 0.08)",
});

const actionsStyle = css({
    display: "flex",
    gap: "var(--fui-spacing-2)",
    marginTop: "var(--fui-spacing-2)",
});

const actionButtonStyle = css({
    padding: "8px 16px",
    fontFamily: "var(--fui-font)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--fui-border)",
    background: "transparent",
    color: "var(--fui-text-dim)",
    transition: "all 0.15s ease",
    "&:hover:not(:disabled)": {
        borderColor: "var(--fui-primary-100)",
        color: "var(--fui-primary-100)",
    },
    "&:disabled": {
        opacity: 0.4,
        cursor: "not-allowed",
    },
});

interface AlbumCoverProps {
    plainLyrics: string;
    songTitle: string;
    styles: string;
}

export function AlbumCover({ plainLyrics, songTitle, styles }: AlbumCoverProps) {
    const [compositeDataUrl, setCompositeDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<"idle" | "generating" | "compositing">("idle");

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStep("generating");
        try {
            const res = await generateAlbumCover({
                plainLyrics,
                songTitle,
                styles,
            });

            setStep("compositing");
            const dataUrl = await compositeAlbumCover({
                artworkBase64: res.image_base64,
                mimeType: res.mime_type,
                songTitle,
            });

            setCompositeDataUrl(dataUrl);
            setStep("idle");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to generate album cover");
            setStep("idle");
        } finally {
            setLoading(false);
        }
    }, [plainLyrics, songTitle, styles]);

    const handleDownload = useCallback(() => {
        if (!compositeDataUrl) return;
        const link = document.createElement("a");
        link.href = compositeDataUrl;
        const safeName = songTitle.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
        link.download = `adrift_beats_${safeName}.png`;
        link.click();
    }, [compositeDataUrl, songTitle]);

    const headerButton =
        !compositeDataUrl && !loading ? (
            <button
                css={generateButtonStyle}
                onClick={(e) => {
                    e.stopPropagation();
                    handleGenerate();
                }}
            >
                Generate Cover
            </button>
        ) : undefined;

    return (
        <CollapsibleCard
            title="Album Cover — ADRIFT BEATS"
            titleColor="var(--fui-primary-100)"
            headerRight={headerButton}
        >
            {loading && (
                <div css={loadingStyle}>
                    {step === "generating"
                        ? "Generating artwork with Imagen 4 Ultra..."
                        : "Compositing typography overlay..."}
                </div>
            )}

            {error && <div css={errorStyle}>{error}</div>}

            {compositeDataUrl && (
                <>
                    <div css={imageContainerStyle}>
                        <img
                            css={imageStyle}
                            src={compositeDataUrl}
                            alt={`Album cover for ${songTitle}`}
                        />
                    </div>
                    <div css={actionsStyle}>
                        <button css={actionButtonStyle} onClick={handleDownload}>
                            Download PNG
                        </button>
                        <button
                            css={actionButtonStyle}
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            Regenerate
                        </button>
                    </div>
                </>
            )}
        </CollapsibleCard>
    );
}
