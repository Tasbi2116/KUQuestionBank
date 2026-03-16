import { NavLink, useNavigate } from "react-router-dom";
import {
    BookOpen,
    LayoutDashboard,
    FolderOpen,
    Bookmark,
    User,
    LogOut,
    ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import { toast } from "react-hot-toast";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/browse", label: "Browse", icon: FolderOpen },
    { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: User },
];

const adminItems = [
    { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
];

interface Props {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: Props) {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out");
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-100">KU Question Bank</p>
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
                {profile?.role === "admin" && (
                    <>
                        <div className="pt-3 pb-1 px-3">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Admin
                            </p>
                        </div>
                        {adminItems.map(({ to, label, icon: Icon }) => (
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
                    </>
                )}
            </nav>

            {/* User info + sign out */}
            <div className="px-3 py-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-white">
                            {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                            {profile?.full_name ?? "Loading..."}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {profile?.student_id ?? ""}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </div>
    );
}