import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Theme = "dark" | "light" | "a11y";

export const THEMES: { id: Theme; label: string; hint: string }[] = [
    { id: "dark", label: "Dark", hint: "Midnight Luxe" },
    { id: "light", label: "Light", hint: "Ivory Luxe" },
    { id: "a11y", label: "Accessibility", hint: "High contrast" },
];

const STORAGE_KEY = "sunobrain.theme";

export function useTheme() {
    const [theme, setTheme] = useLocalStorage<Theme>(STORAGE_KEY, "dark");

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        // Keep Tailwind's class-based dark mode aligned so any `dark:`
        // utilities (if introduced later) resolve sensibly.
        if (theme === "light") {
            root.classList.remove("dark");
        } else {
            root.classList.add("dark");
        }
    }, [theme]);

    return [theme, setTheme] as const;
}
