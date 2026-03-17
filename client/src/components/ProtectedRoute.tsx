import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Props {
    adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: Props) {
    const { user, profile, loading } = useAuth();
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (!loading) return;
        const timer = setTimeout(() => setTimedOut(true), 5000);
        return () => clearTimeout(timer);
    }, [loading]);

    if (loading && !timedOut) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (adminOnly) {
        const role = profile?.role;
        const hasAccess = role === "admin" || role === "discipline_admin";
        if (!hasAccess) return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}