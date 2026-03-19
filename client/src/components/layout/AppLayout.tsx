import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Global Ctrl+K shortcut → jump to search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                navigate("/search");
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [navigate]);

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-60 flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile topbar */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-gray-100"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <span className="text-sm font-medium text-gray-100 flex-1">
                        KU Question Bank
                    </span>

                    {/* Search button — mobile */}
                    <button
                        onClick={() => navigate("/search")}
                        className="text-gray-400 hover:text-gray-100 transition-colors p-1"
                        title="Search (Ctrl+K)"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}