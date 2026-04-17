export type TopMode = "oneshot" | "builder";
export type FlowType = "oneshot" | "twostep";
export type Provider = "gemini" | "deepseek";

export interface ModelOption {
    id: string;
    label: string;
}

export const GEMINI_MODELS: ModelOption[] = [
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (preview)" },
    { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite (preview)" },
];

export const DEEPSEEK_MODELS: ModelOption[] = [
    { id: "deepseek-chat", label: "DeepSeek V3.2" },
    { id: "deepseek-reasoner", label: "DeepSeek V3.2 (Reasoner)" },
];

export const DEFAULT_MODEL: Record<Provider, string> = {
    gemini: "gemini-2.5-pro",
    deepseek: "deepseek-chat",
};

export const PROVIDER_LABEL: Record<Provider, string> = {
    gemini: "Google Gemini",
    deepseek: "DeepSeek",
};

export type GenerateMode =
    | "lyrics"
    | "theme_oneshot"
    | "theme_draft"
    | "optimize_draft"
    | "builder_oneshot"
    | "builder_draft";
export type GenerateStep = "input" | "draft_review" | "complete";

export interface BuilderInputs {
    inspiration: string;
    genres: string[];
    styleInfluences: string;
    lyricInput: string;
    exclusions: string;
}

export interface SavedStyle {
    id: string;
    name: string;
    styleText: string;
    excludeStyles: string;
    genres: string[];
    charCount: number;
    createdAt: string;
}

export interface AnalysisOutput {
    vibe_dna: string;
    phonetic_mapping: string;
    semantic_weight: string;
}

export interface GenerateResponse {
    styles: string;
    exclude_styles: string;
    lyrics: string;
    plain_lyrics: string;
    analysis: AnalysisOutput;
}

export interface AlbumCoverResponse {
    image_base64: string;
    mime_type: string;
}

export interface GenerateState {
    topMode: TopMode;
    flow: FlowType;
    step: GenerateStep;
    input: string;
    builderInputs: BuilderInputs;
    draft: string;
    result: GenerateResponse | null;
    loading: boolean;
    error: string | null;
}
