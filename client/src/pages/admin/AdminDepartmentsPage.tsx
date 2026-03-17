import { useEffect, useState } from "react";
import { FolderOpen, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Department } from "@/types";
import { cn } from "@/utils/cn";

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", short_name: "" });
    const [editForm, setEditForm] = useState({ name: "", short_name: "" });
    const [saving, setSaving] = useState(false);

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get<{
                success: boolean;
                data: Department[];
            }>("/api/departments");
            if (data.success) setDepartments(data.data);
        } catch {
            toast.error("Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreate = async () => {
        if (!form.name.trim() || !form.short_name.trim()) {
            toast.error("Both fields are required");
            return;
        }
        setSaving(true);
        try {
            const { data } = await api.post("/api/departments", {
                name: form.name.trim(),
                short_name: form.short_name.trim().toUpperCase(),
            });
            if (data.success) {
                setDepartments((prev) => [...prev, data.data]);
                setForm({ name: "", short_name: "" });
                setShowForm(false);
                toast.success("Department created");
            }
        } catch {
            toast.error("Failed to create department");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editForm.name.trim() || !editForm.short_name.trim()) {
            toast.error("Both fields are required");
            return;
        }
        setSaving(true);
        try {
            const { data } = await api.patch(`/api/departments/${id}`, {
                name: editForm.name.trim(),
                short_name: editForm.short_name.trim().toUpperCase(),
            });
            if (data.success) {
                setDepartments((prev) =>
                    prev.map((d) => (d.id === id ? data.data : d))
                );
                setEditingId(null);
                toast.success("Department updated");
            }
        } catch {
            toast.error("Failed to update department");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (dept: Department) => {
        if (
            !window.confirm(
                `Delete department "${dept.name}"? All associated courses will also be deleted.`
            )
        )
            return;
        try {
            await api.delete(`/api/departments/${dept.id}`);
            setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
            toast.success("Department deleted");
        } catch {
            toast.error("Failed to delete department");
        }
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        setEditForm({ name: dept.name, short_name: dept.short_name });
    };

    return (
        <div className="space-y-5 max-w-3xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-teal-400" />
                        Departments
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {departments.length} departments
                    </p>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Add Department
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="card space-y-3">
                    <h3 className="text-sm font-medium text-gray-200">
                        New Department
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Full name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, name: e.target.value }))
                                }
                                placeholder="Computer Science and Engineering"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Short name
                            </label>
                            <input
                                type="text"
                                value={form.short_name}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        short_name: e.target.value.toUpperCase(),
                                    }))
                                }
                                placeholder="CSE"
                                className="input-field"
                                maxLength={20}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={saving}
                            className={cn("btn-primary", saving && "opacity-50")}
                        >
                            {saving ? "Saving..." : "Create"}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Departments list */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-2">
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            className="card flex items-center justify-between gap-4"
                        >
                            {editingId === dept.id ? (
                                /* Edit mode */
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm((f) => ({ ...f, name: e.target.value }))
                                        }
                                        className="input-field text-sm py-1.5"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.short_name}
                                        onChange={(e) =>
                                            setEditForm((f) => ({
                                                ...f,
                                                short_name: e.target.value.toUpperCase(),
                                            }))
                                        }
                                        className="input-field text-sm py-1.5"
                                        maxLength={20}
                                    />
                                </div>
                            ) : (
                                /* View mode */
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-teal-600/10 flex items-center justify-center flex-shrink-0">
                                        <FolderOpen className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-100 truncate">
                                            {dept.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{dept.short_name}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {editingId === dept.id ? (
                                    <>
                                        <button
                                            onClick={() => handleUpdate(dept.id)}
                                            disabled={saving}
                                            className="p-1.5 rounded-lg text-green-400 hover:bg-green-900/20 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEdit(dept)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-100 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept)}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}