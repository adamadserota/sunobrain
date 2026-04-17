import type { GenerateMode, GenerateResponse, AlbumCoverResponse, Provider } from "../types";

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
            model: params.model || "imagen-4.0-ultra-generate-001",
        }),
    });
}
