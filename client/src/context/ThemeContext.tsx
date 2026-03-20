import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "ku-qb-theme";

function getInitialTheme(): Theme {
    // 1. Check localStorage first — user's explicit preference wins
    try {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored === "light" || stored === "dark") return stored;
    } catch {
        // localStorage blocked (private mode etc.) — fall through
    }

    // 2. Fall back to system preference
    if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
        return "light";
    }

    // 3. Default to dark
    return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    // Apply / remove "dark" class on <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Ignore storage errors
        }
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider
            value={{ theme, toggleTheme, isDark: theme === "dark" }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}