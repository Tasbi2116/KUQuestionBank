import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    FolderOpen,
    BookOpen,
    FileText,
    TrendingUp,
    Shield,
    ShieldCheck,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

interface Stats {
    totalUsers: number;
    totalDepartments: number;
    totalCourses: number;
    totalFiles: number;
}

export default function AdminDashboardPage() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalDepartments: 0,
        totalCourses: 0,
        totalFiles: 0,
    });
    const [loading, setLoading] = useState(true);
    const isFullAdmin = profile?.role === "admin";

    useEffect(() => {
        api
            .get<{ success: boolean; data: Stats }>("/api/admin/stats")
            .then(({ data }) => {
                if (data.success) setStats(data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        {
            label: isFullAdmin ? "Total Users" : "Dept. Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-600/10",
            to: "/admin/users",
            show: true,
        },
        {
            label: "Departments",
            value: stats.totalDepartments,
            icon: FolderOpen,
            color: "text-teal-400",
            bg: "bg-teal-600/10",
            to: "/admin/departments",
            show: isFullAdmin,
        },
        {
            label: isFullAdmin ? "Total Courses" : "Dept. Courses",
            value: stats.totalCourses,
            icon: BookOpen,
            color: "text-primary-400",
            bg: "bg-primary-600/10",
            to: "/admin/courses",
            show: true,
        },
        {
            label: "Question Files",
            value: stats.totalFiles,
            icon: FileText,
            color: "text-amber-400",
            bg: "bg-amber-600/10",
            to: "/admin/files",
            show: true,
        },
    ].filter((c) => c.show);

    const quickActions = [
        {
            to: "/admin/users",
            label: "Manage Users",
            desc: isFullAdmin
                ? "View, edit roles, delete users"
                : "Manage users in your department",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-600/10",
            show: true,
        },
        {
            to: "/admin/departments",
            label: "Manage Departments",
            desc: "Add or remove departments",
            icon: FolderOpen,
            color: "text-teal-400",
            bg: "bg-teal-600/10",
            show: isFullAdmin,
        },
        {
            to: "/admin/courses",
            label: "Manage Courses",
            desc: isFullAdmin
                ? "Add, edit, delete all courses"
                : "Manage courses in your department",
            icon: BookOpen,
            color: "text-primary-400",
            bg: "bg-primary-600/10",
            show: true,
        },
        {
            to: "/admin/files",
            label: "Manage Files",
            desc: "View and delete uploaded question papers",
            icon: FileText,
            color: "text-amber-400",
            bg: "bg-amber-600/10",
            show: true,
        },
    ].filter((a) => a.show);

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isFullAdmin ? "bg-red-600/20" : "bg-amber-600/20"
                    )}
                >
                    {isFullAdmin ? (
                        <ShieldCheck className={cn("w-5 h-5", "text-red-400")} />
                    ) : (
                        <Shield className={cn("w-5 h-5", "text-amber-400")} />
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-100">
                        {isFullAdmin ? "Admin Dashboard" : "Discipline Admin Dashboard"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {isFullAdmin
                            ? "Full system overview"
                            : `Managing your department only`}
                    </p>
                </div>
            </div>

            {/* Stats */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div
                        className={cn(
                            "w-6 h-6 border-2 border-t-transparent rounded-full animate-spin",
                            isFullAdmin ? "border-red-500" : "border-amber-500"
                        )}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color, bg, to }) => (
                        <Link
                            key={label}
                            to={to}
                            className="card flex items-center gap-4 hover:border-gray-600 transition-all duration-200 hover:scale-[1.02] group"
                        >
                            <div
                                className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
                            >
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-100">
                                    {value}
                                </p>
                                <p className="text-xs text-gray-500">{label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Quick actions */}
            <div>
                <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Quick actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickActions.map(({ to, label, desc, icon: Icon, color, bg }) => (
                        <Link
                            key={to}
                            to={to}
                            className="card flex items-center gap-4 hover:border-gray-600 transition-all duration-200 hover:translate-x-1 group"
                        >
                            <div
                                className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
                            >
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
                                    {label}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}