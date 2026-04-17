import type { GenerateMode, GenerateResponse, AlbumCoverResponse, Provider, RefreshSection } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "";

class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function apiFetch<T>(url: string, options: RequestInit, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, {
        ...options,
        signal,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            message = body.detail || body.error?.message || message;
        } catch {
            // Use default message
        }
        throw new ApiError(res.status, message);
    }

    return res.json() as Promise<T>;
}

export async function generateSong(params: {
    mode: GenerateMode;
    input: string;
    model?: string;
    provider?: Provider;
    apiKey?: string; // kept for backward-compat in signature; server uses env vars
    signal?: AbortSignal;
}): Promise<GenerateResponse> {
    return apiFetch<GenerateResponse>(
        `${API_BASE}/api/generate`,
        {
            method: "POST",
            body: JSON.stringify({
                mode: params.mode,
                input: params.input,
                model: params.model || "gemini-2.5-pro",
                provider: params.provider || "gemini",
            }),
        },
        params.signal,
    );
}

const REFRESH_MODE: Record<RefreshSection, GenerateMode> = {
    title: "refresh_title",
    styles: "refresh_styles",
    exclude: "refresh_exclude",
    lyrics: "refresh_lyrics",
};

export async function refreshSection(params: {
    section: RefreshSection;
    current: GenerateResponse;
    currentTitle: string;
    originalInput: string;
    model?: string;
    provider?: Provider;
    signal?: AbortSignal;
}): Promise<GenerateResponse> {
    const ctx = [
        "---CURRENT_TITLE---",
        params.currentTitle || "(none)",
        "---CURRENT_STYLES---",
        params.current.styles || "(none)",
        "---CURRENT_EXCLUDE---",
        params.current.exclude_styles || "(none)",
        "---CURRENT_LYRICS---",
        params.current.lyrics || "(none)",
        "---ORIGINAL_INPUT---",
        params.originalInput || "(none)",
    ].join("\n");

    return apiFetch<GenerateResponse>(
        `${API_BASE}/api/generate`,
        {
            method: "POST",
            body: JSON.stringify({
                mode: REFRESH_MODE[params.section],
                input: ctx,
                model: params.model || "gemini-2.5-pro",
                provider: params.provider || "gemini",
            }),
        },
        params.signal,
    );
}

export async function generateAlbumCover(params: {
    plainLyrics: string;
    songTitle: string;
    styles: string;
    model?: string;
}): Promise<AlbumCoverResponse> {
    return apiFetch<AlbumCoverResponse>(`${API_BASE}/api/album-cover`, {
        method: "POST",
        body: JSON.stringify({
            plain_lyrics: params.plainLyrics,
            song_title: params.songTitle,
            styles: params.styles,
            model: params.model || "imagen-4.0-generate-preview-06-06",
        }),
    });
}
