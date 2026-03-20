import { NavLink, useNavigate } from "react-router-dom";
import {
    BookOpen,
    LayoutDashboard,
    FolderOpen,
    Bookmark,
    User,
    LogOut,
    ShieldCheck,
    Shield,
    Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import { toast } from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/browse", label: "Browse", icon: FolderOpen },
    { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/search", label: "Search", icon: Search },
];

interface Props {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: Props) {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const role = profile?.role ?? "student";
    const isFullAdmin = role === "admin";
    const isDisciplineAdmin = role === "discipline_admin";
    const hasAdminAccess = isFullAdmin || isDisciplineAdmin;

    const adminLabel = isFullAdmin ? "Admin Panel" : "Discipline Admin";

    const avatarBg = isFullAdmin
        ? "bg-red-700"
        : isDisciplineAdmin
            ? "bg-amber-700"
            : "bg-primary-700";

    const roleLabel = isFullAdmin
        ? "Administrator"
        : isDisciplineAdmin
            ? "Discipline Admin"
            : "Student";

    const roleColor = isFullAdmin
        ? "text-red-400"
        : isDisciplineAdmin
            ? "text-amber-400"
            : "text-gray-500";

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success("Signed out successfully");
            navigate("/login", { replace: true });
        } catch {
            toast.error("Sign out failed. Please try again.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-100">
                        KU Question Bank
                    </p>
                    <p className="text-xs text-gray-500">Khulna University</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary-600/20 text-primary-400"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                            )
                        }
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                    </NavLink>
                ))}

                {/* Admin section */}
                {hasAdminAccess && (
                    <>
                        <div className="pt-3 pb-1 px-3">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                                {isFullAdmin ? "Administration" : "Discipline"}
                            </p>
                        </div>
                        <NavLink
                            to="/admin"
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
                            {isFullAdmin ? (
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <Shield className="w-4 h-4 flex-shrink-0" />
                            )}
                            {adminLabel}
                        </NavLink>
                    </>
                )}
            </nav>

            {/* User info + sign out */}
            <div className="px-3 py-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div
                        className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                            avatarBg
                        )}
                    >
                        <span className="text-xs font-medium text-white">
                            {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                            {profile?.full_name ?? "Loading..."}
                        </p>
                        <p className={cn("text-xs truncate", roleColor)}>
                            {roleLabel}
                        </p>
                    </div>
                </div>
                <ThemeToggle variant="full" className="mb-2" />
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