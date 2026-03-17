import { useEffect, useState } from "react";
import { Users, Trash2, ShieldCheck, ShieldOff, Search } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { cn } from "@/utils/cn";

interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    student_id: string;
    role: "student" | "admin";
    department_id: string;
    created_at: string;
    departments?: { short_name: string };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filtered, setFiltered] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get<{
                success: boolean;
                data: AdminUser[];
            }>("/api/admin/users");
            if (data.success) {
                setUsers(data.data);
                setFiltered(data.data);
            }
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            users.filter(
                (u) =>
                    u.full_name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.student_id.includes(q)
            )
        );
    }, [search, users]);

    const handleToggleRole = async (user: AdminUser) => {
        const newRole = user.role === "admin" ? "student" : "admin";
        const confirm = window.confirm(
            `Change ${user.full_name}'s role to ${newRole}?`
        );
        if (!confirm) return;

        try {
            const { data } = await api.patch(`/api/admin/users/${user.id}/role`, {
                role: newRole,
            });
            if (data.success) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
                );
                toast.success(`Role updated to ${newRole}`);
            }
        } catch {
            toast.error("Failed to update role");
        }
    };

    const handleDelete = async (user: AdminUser) => {
        const confirm = window.confirm(
            `Delete user ${user.full_name}? This cannot be undone.`
        );
        if (!confirm) return;

        try {
            const { data } = await api.delete(`/api/admin/users/${user.id}`);
            if (data.success) {
                setUsers((prev) => prev.filter((u) => u.id !== user.id));
                toast.success("User deleted");
            }
        } catch {
            toast.error("Failed to delete user");
        }
    };

    return (
        <div className="space-y-5 max-w-5xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Users
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {users.length} registered users
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, ID..."
                        className="input-field pl-9 w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-10">
                    <p className="text-gray-500">No users found</p>
                </div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Email
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-medium text-white">
                                                        {user.full_name[0]?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-gray-200 font-medium">
                                                    {user.full_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 font-mono">
                                            {user.student_id}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "text-xs px-2 py-1 rounded-full font-medium",
                                                    user.role === "admin"
                                                        ? "bg-red-600/20 text-red-400"
                                                        : "bg-gray-700 text-gray-300"
                                                )}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleRole(user)}
                                                    title={
                                                        user.role === "admin"
                                                            ? "Demote to student"
                                                            : "Promote to admin"
                                                    }
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-colors",
                                                        user.role === "admin"
                                                            ? "text-red-400 hover:bg-red-900/20"
                                                            : "text-blue-400 hover:bg-blue-900/20"
                                                    )}
                                                >
                                                    {user.role === "admin" ? (
                                                        <ShieldOff className="w-4 h-4" />
                                                    ) : (
                                                        <ShieldCheck className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    title="Delete user"
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}