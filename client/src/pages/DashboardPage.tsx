import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderOpen, Upload, Bookmark, BookOpen, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

interface Stats {
    totalUploads: number;
    totalBookmarks: number;
    totalCourses: number;
}

export default function DashboardPage() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({
        totalUploads: 0,
        totalBookmarks: 0,
        totalCourses: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [uploadsRes, bookmarksRes, coursesRes] = await Promise.all([
                    api.get<{ success: boolean; data: unknown[] }>("/api/uploads"),
                    api.get<{ success: boolean; data: unknown[] }>("/api/bookmarks"),
                    api.get<{ success: boolean; data: unknown[] }>("/api/courses"),
                ]);
                setStats({
                    totalUploads: uploadsRes.data.data?.length ?? 0,
                    totalBookmarks: bookmarksRes.data.data?.length ?? 0,
                    totalCourses: coursesRes.data.data?.length ?? 0,
                });
            } catch {
                // stats remain at 0
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Total Question Files",
            value: stats.totalUploads,
            icon: Upload,
            color: "text-primary-400",
            bg: "bg-primary-600/10",
        },
        {
            label: "My Bookmarks",
            value: stats.totalBookmarks,
            icon: Bookmark,
            color: "text-amber-400",
            bg: "bg-amber-600/10",
        },
        {
            label: "CSE Courses",
            value: stats.totalCourses,
            icon: BookOpen,
            color: "text-teal-400",
            bg: "bg-teal-600/10",
        },
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Welcome */}
            <div>
                <h1 className="text-xl font-semibold text-gray-100">
                    Welcome back, {profile?.full_name?.split(" ")[0] ?? "Student"} 👋
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Student ID: {profile?.student_id} ·{" "}
                    {profile?.role === "admin" ? "Administrator" : "Student"}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="card flex items-center gap-4">
                        <div
                            className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
                        >
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-100">{value}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search quick access */}
            <button
                onClick={() => navigate("/search")}
                className="w-full card flex items-center gap-3 text-left hover:border-primary-700/50 hover:bg-gray-800/30 transition-all duration-200 group"
            >
                <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-primary-400 transition-colors">
                        Search question papers...
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                        Search by course, batch, exam type
                    </p>
                </div>
                <kbd className="hidden sm:flex items-center gap-1 text-xs text-gray-600 border border-gray-700 rounded px-2 py-1">
                    Ctrl K
                </kbd>
            </button>

            {/* Quick actions */}
            <div>
                <h2 className="text-sm font-medium text-gray-400 mb-3">
                    Quick actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to="/browse"
                        className="card flex items-center gap-4 hover:border-primary-700 hover:bg-gray-800/50 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-100 group-hover:text-primary-400 transition-colors">
                                Browse Question Papers
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Find papers by department, term, and course
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/bookmarks"
                        className="card flex items-center gap-4 hover:border-amber-700 hover:bg-gray-800/50 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-amber-600/10 flex items-center justify-center">
                            <Bookmark className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-100 group-hover:text-amber-400 transition-colors">
                                My Bookmarks
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                View your saved question papers
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}