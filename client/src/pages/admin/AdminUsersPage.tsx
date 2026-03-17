import { useEffect, useState } from "react";
import {
  Users,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Shield,
  Search,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { cn } from "@/utils/cn";

type AdminUserRole = "student" | "discipline_admin" | "admin";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  role: AdminUserRole;
  department_id: string;
  created_at: string;
  departments?: { short_name: string; name: string };
}

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  const actorRole    = profile?.role ?? "student";
  const isFullAdmin  = actorRole === "admin";

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
    // Determine next role based on actor permissions
    let newRole: AdminUserRole;

    if (isFullAdmin) {
      // Full admin cycles: student → discipline_admin → admin → student
      if (user.role === "student") newRole = "discipline_admin";
      else if (user.role === "discipline_admin") newRole = "admin";
      else newRole = "student";
    } else {
      // Discipline admin can only toggle: student ↔ keep student
      // (they can't promote — only demote to student via delete if needed)
      toast.error("Discipline admin cannot change user roles");
      return;
    }

    const roleLabel =
      newRole === "discipline_admin" ? "Discipline Admin" : newRole;

    if (
      !window.confirm(`Change ${user.full_name}'s role to ${roleLabel}?`)
    )
      return;

    try {
      const { data } = await api.patch(
        `/api/admin/users/${user.id}/role`,
        { role: newRole }
      );
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        toast.success(`Role updated to ${roleLabel}`);
      }
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (
      !window.confirm(
        `Delete user ${user.full_name}? This cannot be undone.`
      )
    )
      return;

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

  const getRoleBadge = (role: AdminUserRole) => {
    if (role === "admin") {
      return (
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-600/20 text-red-400">
          Admin
        </span>
      );
    }
    if (role === "discipline_admin") {
      return (
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-600/20 text-amber-400">
          Discipline Admin
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-700 text-gray-300">
        Student
      </span>
    );
  };

  const getRoleIcon = (user: AdminUser) => {
    if (user.role === "admin") {
      return <ShieldOff className="w-4 h-4" />;
    }
    if (user.role === "discipline_admin") {
      return <ShieldCheck className="w-4 h-4" />;
    }
    return <Shield className="w-4 h-4" />;
  };

  return (
    <div className="space-y-5 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Users
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {users.length} {isFullAdmin ? "total" : "department"} users
          </p>
        </div>

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
                  <tr
                    key={user.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                            user.role === "admin"
                              ? "bg-red-700"
                              : user.role === "discipline_admin"
                              ? "bg-amber-700"
                              : "bg-primary-700"
                          )}
                        >
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
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Only full admin can change roles */}
                        {isFullAdmin && (
                          <button
                            onClick={() => handleToggleRole(user)}
                            title="Change role"
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              user.role === "admin"
                                ? "text-red-400 hover:bg-red-900/20"
                                : user.role === "discipline_admin"
                                ? "text-amber-400 hover:bg-amber-900/20"
                                : "text-blue-400 hover:bg-blue-900/20"
                            )}
                          >
                            {getRoleIcon(user)}
                          </button>
                        )}
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