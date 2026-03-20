import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/utils/cn";

interface ThemeToggleProps {
    /** compact = icon only, full = icon + label */
    variant?: "compact" | "full";
    className?: string;
}

export default function ThemeToggle({
    variant = "compact",
    className,
}: ThemeToggleProps) {
    const { isDark, toggleTheme } = useTheme();

    if (variant === "full") {
        return (
            <button
                onClick={toggleTheme}
                className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "text-gray-400 hover:bg-gray-800 hover:text-gray-100",
                    "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                    "light:text-gray-600 light:hover:bg-gray-100 light:hover:text-gray-900",
                    className
                )}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
                {isDark ? (
                    <Sun className="w-4 h-4 flex-shrink-0 text-amber-400" />
                ) : (
                    <Moon className="w-4 h-4 flex-shrink-0 text-primary-400" />
                )}
                <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
                "p-2 rounded-lg transition-colors",
                "text-gray-400 hover:bg-gray-800 hover:text-gray-100",
                className
            )}
        >
            {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
            ) : (
                <Moon className="w-4 h-4 text-primary-400" />
            )}
        </button>
    );
}