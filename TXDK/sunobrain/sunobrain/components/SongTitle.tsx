/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { CopyButton } from "./CopyButton";

const titleTextStyle = css({
    fontFamily: "var(--fui-font)",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "var(--fui-primary-100)",
});

const editInputStyle = css({
    width: "100%",
    padding: "8px 10px",
    fontFamily: "var(--fui-font)",
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    background: "var(--fui-bg-input)",
    border: "1px solid var(--fui-primary-100)",
    color: "var(--fui-primary-100)",
    outline: "none",
    boxShadow: "var(--fui-glow-input)",
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

interface SongTitleProps {
    value: string;
    onChange?: (newTitle: string) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
}

export function SongTitle({ value, onChange, onRefresh, refreshing }: SongTitleProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    if (!value) return null;

    const handleEdit = () => {
        setDraft(value);
        setEditing(true);
    };

    const handleSave = () => {
        const trimmed = draft.trim();
        if (trimmed && onChange) {
            onChange(trimmed);
        }
        setEditing(false);
    };

    const handleCancel = () => {
        setDraft(value);
        setEditing(false);
    };

    const headerRight = (
        <div css={css({ display: "flex", alignItems: "center", gap: "var(--fui-spacing-2)" })}>
            {onRefresh && !editing && (
                <button
                    css={editBtnStyle}
                    onClick={onRefresh}
                    disabled={refreshing}
                    title="Regenerate title"
                >
                    {refreshing ? "\u21BB \u2026" : "\u21BB Refresh"}
                </button>
            )}
            {onChange && !editing && (
                <button css={editBtnStyle} onClick={handleEdit}>Edit</button>
            )}
            <CopyButton text={value} />
        </div>
    );

    return (
        <CollapsibleCard
            title="Song Title"
            titleColor="var(--fui-primary-100)"
            headerRight={headerRight}
        >
            {editing ? (
                <>
                    <input
                        css={editInputStyle}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") handleCancel();
                        }}
                        autoFocus
                    />
                    <div css={editActionsStyle}>
                        <button css={[editBtnStyle, saveBtnStyle]} onClick={handleSave}>Save</button>
                        <button css={editBtnStyle} onClick={handleCancel}>Cancel</button>
                    </div>
                </>
            ) : (
                <span css={titleTextStyle}>{value}</span>
            )}
        </CollapsibleCard>
    );
}
