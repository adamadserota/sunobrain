/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { CopyButton } from "./CopyButton";
import { CharCount } from "./CharCount";
import type { SaveStyleParams } from "../hooks/useSavedStyles";

const contentStyle = css({
    fontFamily: "var(--fui-font)",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "var(--fui-text)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
});

const footerStyle = css({
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: "var(--fui-spacing-2)",
});

const headerActionsStyle = css({
    display: "flex",
    alignItems: "center",
    gap: "var(--fui-spacing-2)",
});

const saveButtonStyle = css({
    padding: "4px 10px",
    fontFamily: "var(--fui-font)",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--fui-secondary-100)",
    background: "transparent",
    color: "var(--fui-secondary-100)",
    transition: "all 0.15s ease",
    "&:hover": {
        background: "rgba(51, 187, 255, 0.1)",
    },
});

const saveInputStyle = css({
    display: "flex",
    flexDirection: "column",
    gap: "var(--fui-spacing-2)",
    padding: "var(--fui-spacing-2)",
    border: "1px solid var(--fui-secondary-100)",
    background: "var(--fui-bg-input)",
    marginBottom: "var(--fui-spacing-2)",
});

const saveRowStyle = css({
    display: "flex",
    alignItems: "center",
    gap: "var(--fui-spacing-2)",
});

const nameInputStyle = css({
    flex: 1,
    padding: "6px 10px",
    fontFamily: "var(--fui-font)",
    fontSize: "12px",
    background: "transparent",
    border: "1px solid var(--fui-border)",
    color: "var(--fui-text)",
    outline: "none",
    "&:focus": {
        borderColor: "var(--fui-secondary-100)",
    },
    "&::placeholder": {
        color: "var(--fui-text-muted)",
    },
});

const confirmButtonStyle = css({
    padding: "6px 12px",
    fontFamily: "var(--fui-font)",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--fui-secondary-100)",
    background: "rgba(51, 187, 255, 0.15)",
    color: "var(--fui-secondary-100)",
    "&:hover": {
        background: "rgba(51, 187, 255, 0.25)",
    },
    "&:disabled": {
        opacity: 0.4,
        cursor: "not-allowed",
    },
});

const cancelButtonStyle = css({
    padding: "6px 12px",
    fontFamily: "var(--fui-font)",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--fui-border)",
    background: "transparent",
    color: "var(--fui-text-muted)",
    "&:hover": {
        borderColor: "var(--fui-text)",
        color: "var(--fui-text)",
    },
});

const validationErrorStyle = css({
    fontFamily: "var(--fui-font)",
    fontSize: "11px",
    color: "var(--fui-error-100)",
});

const editTextareaStyle = css({
    width: "100%",
    minHeight: 120,
    padding: "var(--fui-spacing-3)",
    fontFamily: "var(--fui-font)",
    fontSize: "14px",
    lineHeight: 1.6,
    background: "var(--fui-bg-input)",
    border: "1px solid var(--fui-primary-100)",
    color: "var(--fui-text)",
    resize: "vertical",
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

const editSaveBtnStyle = css({
    borderColor: "var(--fui-primary-100)",
    color: "var(--fui-primary-100)",
    background: "var(--fui-primary-10)",
    "&:hover": {
        background: "var(--fui-primary-20)",
    },
});

interface StyleOutputProps {
    value: string;
    excludeStyles?: string;
    genres?: string[];
    onChange?: (newStyles: string) => void;
    onSaveStyle?: (params: SaveStyleParams) => string | null;
    onRefresh?: () => void;
    refreshing?: boolean;
}

export function StyleOutput({ value, excludeStyles, genres, onChange, onSaveStyle, onRefresh, refreshing }: StyleOutputProps) {
    const [saving, setSaving] = useState(false);
    const [styleName, setStyleName] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [editDraft, setEditDraft] = useState(value);

    const handleSaveToLibrary = () => {
        if (!styleName.trim() || !value) return;
        const error = onSaveStyle?.({
            name: styleName.trim(),
            styleText: value,
            excludeStyles: excludeStyles || "",
            genres: genres || [],
        });
        if (error) {
            setValidationError(error);
            return;
        }
        setSaving(false);
        setStyleName("");
        setValidationError(null);
    };

    const handleCancelSave = () => {
        setSaving(false);
        setStyleName("");
        setValidationError(null);
    };

    const handleEdit = () => {
        setEditDraft(value);
        setEditing(true);
    };

    const handleEditSave = () => {
        onChange?.(editDraft);
        setEditing(false);
    };

    const handleEditCancel = () => {
        setEditDraft(value);
        setEditing(false);
    };

    const headerRight = value ? (
        <div css={headerActionsStyle}>
            {onRefresh && !editing && (
                <button
                    css={editBtnStyle}
                    onClick={onRefresh}
                    disabled={refreshing}
                    title="Regenerate style prompt"
                >
                    {refreshing ? "\u21BB \u2026" : "\u21BB Refresh"}
                </button>
            )}
            {onSaveStyle && !editing && (
                <button css={saveButtonStyle} onClick={() => setSaving(true)}>
                    Save
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
            title="Style Prompt"
            titleColor="var(--fui-primary-100)"
            headerRight={headerRight}
        >
            {saving && !editing && (
                <div css={saveInputStyle}>
                    <div css={saveRowStyle}>
                        <input
                            css={nameInputStyle}
                            placeholder="Style name (must be unique)..."
                            value={styleName}
                            onChange={(e) => {
                                setStyleName(e.target.value);
                                setValidationError(null);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveToLibrary()}
                            autoFocus
                        />
                        <button
                            css={confirmButtonStyle}
                            onClick={handleSaveToLibrary}
                            disabled={!styleName.trim()}
                        >
                            Save
                        </button>
                        <button css={cancelButtonStyle} onClick={handleCancelSave}>
                            Cancel
                        </button>
                    </div>
                    {validationError && (
                        <span css={validationErrorStyle}>{validationError}</span>
                    )}
                </div>
            )}
            {editing ? (
                <>
                    <textarea
                        css={editTextareaStyle}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        autoFocus
                    />
                    <div css={editActionsStyle}>
                        <button css={[editBtnStyle, editSaveBtnStyle]} onClick={handleEditSave}>Save</button>
                        <button css={editBtnStyle} onClick={handleEditCancel}>Cancel</button>
                    </div>
                </>
            ) : (
                <div css={contentStyle}>
                    {value || "Generate a song to see the style prompt..."}
                </div>
            )}
            {value && !editing && (
                <div css={footerStyle}>
                    <CharCount current={value.length} max={1000} />
                </div>
            )}
        </CollapsibleCard>
    );
}
