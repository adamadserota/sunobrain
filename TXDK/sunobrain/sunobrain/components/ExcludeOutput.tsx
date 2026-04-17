/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { CopyButton } from "./CopyButton";

const contentStyle = css({
    fontFamily: "var(--fui-font)",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "var(--fui-text-dim)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
});

const editTextareaStyle = css({
    width: "100%",
    minHeight: 80,
    padding: "var(--fui-spacing-3)",
    fontFamily: "var(--fui-font)",
    fontSize: "14px",
    lineHeight: 1.6,
    background: "var(--fui-bg-input)",
    border: "1px solid var(--fui-error-100)",
    color: "var(--fui-text)",
    resize: "vertical",
    outline: "none",
    boxShadow: "0 0 6px rgba(255, 51, 51, 0.15)",
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

interface ExcludeOutputProps {
    value: string;
    onChange?: (newExclude: string) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
}

export function ExcludeOutput({ value, onChange, onRefresh, refreshing }: ExcludeOutputProps) {
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
                    title="Regenerate exclusions"
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
            title="Excluded Styles"
            titleColor="var(--fui-error-100)"
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
                    {value || "Exclusions will appear here after generation..."}
                </div>
            )}
        </CollapsibleCard>
    );
}
