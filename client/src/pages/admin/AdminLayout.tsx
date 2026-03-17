import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    BookOpen,
    FileText,
    LogOut,
    ShieldCheck,
    Shield,
    Menu,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import { toast } from "react-hot-toast";

function AdminSidebar({ onClose }: { onClose?: () => void }) {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const isFullAdmin = profile?.role === "admin";

    const navItems = [
        {
            to: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
            exact: true,
            show: true,
        },
        {
            to: "/admin/users",
            label: "Users",
            icon: Users,
            exact: false,
            show: true,
        },
        {
            to: "/admin/departments",
            label: "Departments",
            icon: FolderOpen,
            exact: false,
            // Discipline admin cannot manage departments
            show: isFullAdmin,
        },
        {
            to: "/admin/courses",
            label: "Courses",
            icon: BookOpen,
            exact: false,
            show: true,
        },
        {
            to: "/admin/files",
            label: "Files",
            icon: FileText,
            exact: false,
            show: true,
        },
    ];

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out");
        navigate("/login", { replace: true });
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                <div
                    className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        isFullAdmin ? "bg-red-600" : "bg-amber-600"
                    )}
                >
                    {isFullAdmin ? (
                        <ShieldCheck className="w-4 h-4 text-white" />
                    ) : (
                        <Shield className="w-4 h-4 text-white" />
                    )}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-100">
                        {isFullAdmin ? "Admin Panel" : "Discipline Admin"}
                    </p>
                    <p className="text-xs text-gray-500">KU Question Bank</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems
                    .filter((item) => item.show)
                    .map(({ to, label, icon: Icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            onClick={onClose}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? isFullAdmin
                                            ? "bg-red-600/20 text-red-400"
                                            : "bg-amber-600/20 text-amber-400"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                                )
                            }
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </NavLink>
                    ))}

                <div className="pt-3">
                    <NavLink
                        to="/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-800 hover:text-gray-100 transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                        Student View
                    </NavLink>
                </div>
            </nav>

            {/* User */}
            <div className="px-3 py-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div
                        className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                            isFullAdmin ? "bg-red-700" : "bg-amber-700"
                        )}
                    >
                        <span className="text-xs font-medium text-white">
                            {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                            {profile?.full_name ?? "Admin"}
                        </p>
                        <p
                            className={cn(
                                "text-xs",
                                isFullAdmin ? "text-red-400" : "text-amber-400"
                            )}
                        >
                            {isFullAdmin ? "Administrator" : "Discipline Admin"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            <aside className="hidden lg:flex lg:flex-col lg:w-60 flex-shrink-0">
                <AdminSidebar />
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
                        <AdminSidebar onClose={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-gray-100"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-100">
                        Admin Panel
                    </span>
                    {sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </header>
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}