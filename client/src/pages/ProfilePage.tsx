import { useState, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { User, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { cn } from "@/utils/cn";

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState(profile?.full_name ?? "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.patch("/api/auth/me", {
                full_name: fullName,
            });
            if (data.success) {
                await refreshProfile();
                toast.success("Profile updated");
            }
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-100">Profile</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Manage your account information
                </p>
            </div>

            {/* Avatar */}
            <div className="card flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-white">
                        {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-gray-100">{profile?.full_name}</p>
                    <p className="text-sm text-gray-400">{profile?.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                        {profile?.role} · Student ID: {profile?.student_id}
                    </p>
                </div>
            </div>

            {/* Edit form */}
            <div className="card">
                <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Edit profile
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                            Full name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                            Email address
                        </label>
                        <input
                            type="email"
                            value={profile?.email ?? ""}
                            disabled
                            className="input-field opacity-50 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                            Student ID
                        </label>
                        <input
                            type="text"
                            value={profile?.student_id ?? ""}
                            disabled
                            className="input-field opacity-50 cursor-not-allowed"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={cn("btn-primary", loading && "opacity-50")}
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}