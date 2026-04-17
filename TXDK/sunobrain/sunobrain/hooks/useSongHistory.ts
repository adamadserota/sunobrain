import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import type { GenerateResponse } from "../types";

export interface HistoryEntry {
    id: string;
    title: string;
    createdAt: string;
    result: GenerateResponse;
}

const MAX_HISTORY = 10;
const TABLE = "songs";

function extractTitle(lyrics: string): string {
    const match = lyrics.match(/\[Title:\s*(.+?)\]/i);
    return match?.[1]?.trim() || "Untitled";
}

interface SongRow {
    id: string;
    title: string;
    created_at: string;
    result: GenerateResponse;
}

function rowToEntry(row: SongRow): HistoryEntry {
    return {
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        result: row.result,
    };
}

export function useSongHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        setError(null);
        const { data, error: qErr } = await supabase
            .from(TABLE)
            .select("id, title, created_at, result")
            .order("created_at", { ascending: false })
            .limit(MAX_HISTORY);
        if (qErr) {
            setError(qErr.message);
        } else if (data) {
            setHistory((data as SongRow[]).map(rowToEntry));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const addEntry = useCallback(
        async (result: GenerateResponse): Promise<string | null> => {
            if (!supabase) return null;
            const title = extractTitle(result.lyrics);
            const { data, error: iErr } = await supabase
                .from(TABLE)
                .insert({ title, result })
                .select("id, title, created_at, result")
                .single();
            if (iErr || !data) {
                setError(iErr?.message ?? "Failed to save song");
                return null;
            }
            const entry = rowToEntry(data as SongRow);
            setHistory((prev) => {
                const next = [entry, ...prev].slice(0, MAX_HISTORY);
                const removed = prev.slice(MAX_HISTORY - 1);
                if (removed.length > 0) {
                    const oldIds = removed.map((e) => e.id);
                    supabase!.from(TABLE).delete().in("id", oldIds).then(() => {});
                }
                return next;
            });
            return entry.id;
        },
        [],
    );

    const updateEntry = useCallback(
        async (id: string, patch: Partial<GenerateResponse>) => {
            if (!supabase) return;
            const current = history.find((e) => e.id === id);
            if (!current) return;
            const nextResult = { ...current.result, ...patch };
            const nextTitle = extractTitle(nextResult.lyrics);
            setHistory((prev) =>
                prev.map((e) =>
                    e.id === id ? { ...e, result: nextResult, title: nextTitle } : e,
                ),
            );
            const { error: uErr } = await supabase
                .from(TABLE)
                .update({ title: nextTitle, result: nextResult })
                .eq("id", id);
            if (uErr) setError(uErr.message);
        },
        [history],
    );

    const deleteEntry = useCallback(
        async (id: string) => {
            if (!supabase) return;
            setHistory((prev) => prev.filter((e) => e.id !== id));
            const { error: dErr } = await supabase.from(TABLE).delete().eq("id", id);
            if (dErr) setError(dErr.message);
        },
        [],
    );

    const clearHistory = useCallback(async () => {
        if (!supabase) return;
        const ids = history.map((e) => e.id);
        setHistory([]);
        if (ids.length > 0) {
            const { error: cErr } = await supabase.from(TABLE).delete().in("id", ids);
            if (cErr) setError(cErr.message);
        }
    }, [history]);

    return {
        history,
        loading,
        error,
        configured: isSupabaseConfigured,
        addEntry,
        updateEntry,
        deleteEntry,
        clearHistory,
        refresh: fetchHistory,
    };
}
