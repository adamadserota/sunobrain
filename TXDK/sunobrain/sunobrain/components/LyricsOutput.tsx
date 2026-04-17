/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { CopyButton } from "./CopyButton";
import { CharCount } from "./CharCount";

const contentStyle = css({
    fontFamily: "var(--fui-font)",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "var(--fui-text)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
});

const tagStyle = css({
    color: "var(--fui-secondary-100)",
    fontWeight: 600,
});

const footerStyle = css({
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "var(--fui-spacing-2)",
});

const editTextareaStyle = css({
    width: "100%",
    minHeight: 300,
    padding: "var(--fui-spacing-3)",
    fontFamily: "var(--fui-font)",
    fontSize: "14px",
    lineHeight: 1.7,
    background: "var(--fui-bg-input)",
    border: "1px solid var(--fui-primary-100)",
    color: "var(--fui-text)",
    resize: "vertical",
    outline: "none",
    boxShadow: "var(--fui-glow-input)",
    "&::placeholder": {
        color: "var(--fui-text-muted)",
    },
});

const editActionsStyle = css({
    display: "flex",
    gap: "var(--fui-spacing-2)",
    marginTop: "var(--fui-spacing-2)",
});

const editBtnStyle = css({
    padding: "4px 10px",
    fontFamily: "var(--fui-font)",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--fui-border)",
    background: "transparent",
    color: "var(--fui-text-muted)",
    transition: "all 0.15s ease",
    "&:hover": {
        borderColor: "var(--fui-primary-100)",
        color: "var(--fui-primary-100)",
    },
});

const saveBtnStyle = css({
    borderColor: "var(--fui-primary-100)",
    color: "var(--fui-primary-100)",
    background: "var(--fui-primary-10)",
    "&:hover": {
        background: "var(--fui-primary-20)",
    },
});

interface LyricsOutputProps {
    value: string;
    onChange?: (newLyrics: string) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
}

function highlightTags(text: string) {
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) =>
        part.startsWith("[") && part.endsWith("]") ? (
            <span key={i} css={tagStyle}>
                {part}
            </span>
        ) : (
            part
        ),
    );
}

export function LyricsOutput({ value, onChange, onRefresh, refreshing }: LyricsOutputProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const handleEdit = () => {
        setDraft(value);
        setEditing(true);
    };

    const handleSave = () => {
        onChange?.(draft);
        setEditing(false);
    };

    const handleCancel = () => {
        setDraft(value);
        setEditing(false);
    };

    const headerRight = value ? (
        <div css={css({ display: "flex", alignItems: "center", gap: "var(--fui-spacing-2)" })}>
            {onRefresh && !editing && (
                <button
                    css={editBtnStyle}
                    onClick={onRefresh}
                    disabled={refreshing}
                    title="Regenerate lyrics"
                >
                    {refreshing ? "\u21BB \u2026" : "\u21BB Refresh"}
                </button>
            )}
            {onChange && !editing && (
                <button css={editBtnStyle} onClick={handleEdit}>Edit</button>
            )}
            <CopyButton text={value} />
        </div>
    ) : undefined;

    return (
        <CollapsibleCard
            title="Optimized Lyrics"
            titleColor="var(--fui-primary-100)"
            headerRight={headerRight}
        >
            {editing ? (
                <>
                    <textarea
                        css={editTextareaStyle}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                    />
                    <div css={editActionsStyle}>
                        <button css={[editBtnStyle, saveBtnStyle]} onClick={handleSave}>Save</button>
                        <button css={editBtnStyle} onClick={handleCancel}>Cancel</button>
                    </div>
                </>
            ) : (
                <div css={contentStyle}>
                    {value ? highlightTags(value) : "Optimized lyrics will appear here..."}
                </div>
            )}
            {value && !editing && (
                <div css={footerStyle}>
                    <CharCount current={value.length} max={5000} />
                </div>
            )}
        </CollapsibleCard>
    );
}
