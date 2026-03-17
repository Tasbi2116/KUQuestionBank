import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    FolderOpen,
    BookOpen,
    FileText,
    TrendingUp,
} from "lucide-react";
import api from "@/lib/axios";

interface Stats {
    totalUsers: number;
    totalDepartments: number;
    totalCourses: number;
    totalFiles: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalDepartments: 0,
        totalCourses: 0,
        totalFiles: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, deptsRes, coursesRes, filesRes] = await Promise.all([
                    api.get<{ success: boolean; data: unknown[] }>("/api/admin/users"),
                    api.get<{ success: boolean; data: unknown[] }>("/api/departments"),
                    api.get<{ success: boolean; data: unknown[] }>("/api/courses"),
                    api.get<{ success: boolean; data: unknown[] }>("/api/uploads"),
                ]);
                setStats({
                    totalUsers: usersRes.data.data?.length ?? 0,
                    totalDepartments: deptsRes.data.data?.length ?? 0,
                    totalCourses: coursesRes.data.data?.length ?? 0,
                    totalFiles: filesRes.data.data?.length ?? 0,
                });
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-600/10",
            to: "/admin/users",
        },
        {
            label: "Departments",
            value: stats.totalDepartments,
            icon: FolderOpen,
            color: "text-teal-400",
            bg: "bg-teal-600/10",
            to: "/admin/departments",
        },
        {
            label: "Courses",
            value: stats.totalCourses,
            icon: BookOpen,
            color: "text-primary-400",
            bg: "bg-primary-600/10",
            to: "/admin/courses",
        },
        {
            label: "Question Files",
            value: stats.totalFiles,
            icon: FileText,
            color: "text-amber-400",
            bg: "bg-amber-600/10",
            to: "/admin/files",
        },
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                    Admin Dashboard
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Overview of KU Question Bank
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color, bg, to }) => (
                        <Link
                            key={label}
                            to={to}
                            className="card flex items-center gap-4 hover:border-gray-600 transition-colors group"
                        >
                            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-100">{value}</p>
                                <p className="text-xs text-gray-500">{label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Quick links */}
            <div>
                <h2 className="text-sm font-medium text-gray-400 mb-3">
                    Quick actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { to: "/admin/users", label: "Manage Users", desc: "View, edit roles, delete users", icon: Users, color: "text-blue-400", bg: "bg-blue-600/10" },
                        { to: "/admin/departments", label: "Manage Departments", desc: "Add or remove departments", icon: FolderOpen, color: "text-teal-400", bg: "bg-teal-600/10" },
                        { to: "/admin/courses", label: "Manage Courses", desc: "Add, edit, delete courses", icon: BookOpen, color: "text-primary-400", bg: "bg-primary-600/10" },
                        { to: "/admin/files", label: "Manage Files", desc: "View and delete uploaded question papers", icon: FileText, color: "text-amber-400", bg: "bg-amber-600/10" },
                    ].map(({ to, label, desc, icon: Icon, color, bg }) => (
                        <Link
                            key={to}
                            to={to}
                            className="card flex items-center gap-4 hover:border-gray-600 transition-colors group"
                        >
                            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
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