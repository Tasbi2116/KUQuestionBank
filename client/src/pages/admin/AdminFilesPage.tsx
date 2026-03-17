import { useEffect, useState } from "react";
import { FileText, Trash2, Search, Eye, Image } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

interface AdminFile {
    id: string;
    file_name: string;
    file_type: string;
    exam_type: string;
    batch: string;
    file_size: number;
    created_at: string;
    uploaded_by: string;
    courses: { course_code: string; course_title: string; term: string };
    profiles: { full_name: string; student_id: string };
}

export default function AdminFilesPage() {
    const [files, setFiles] = useState<AdminFile[]>([]);
    const [filtered, setFiltered] = useState<AdminFile[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        try {
            const { data } = await api.get<{
                success: boolean;
                data: AdminFile[];
            }>("/api/uploads");
            if (data.success) {
                setFiles(data.data);
                setFiltered(data.data);
            }
        } catch {
            toast.error("Failed to load files");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            files.filter(
                (f) =>
                    f.file_name.toLowerCase().includes(q) ||
                    f.courses?.course_title?.toLowerCase().includes(q) ||
                    f.profiles?.full_name?.toLowerCase().includes(q) ||
                    f.batch.includes(q)
            )
        );
    }, [search, files]);

    const handleView = async (fileId: string) => {
        try {
            const { data } = await api.get(`/api/uploads/${fileId}`);
            if (data.success && data.data.signed_url) {
                window.open(data.data.signed_url, "_blank");
            }
        } catch {
            toast.error("Failed to open file");
        }
    };

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!window.confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/api/uploads/${fileId}`);
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
            toast.success("File deleted");
        } catch {
            toast.error("Failed to delete file");
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-5 max-w-5xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        Question Files
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {files.length} total files uploaded
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search files..."
                        className="input-field pl-9 w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-10">
                    <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No files found</p>
                </div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        File
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Course
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Uploaded by
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Size
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((file) => (
                                    <tr
                                        key={file.id}
                                        className="hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {file.file_type === "pdf" ? (
                                                    <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                                ) : (
                                                    <Image className="w-4 h-4 text-teal-400 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="text-gray-100 truncate max-w-[180px]">
                                                        {file.file_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {file.exam_type} · Batch {file.batch}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <p className="text-gray-300 text-xs">
                                                {file.courses?.course_code}
                                            </p>
                                            <p className="text-gray-500 text-xs truncate max-w-[140px]">
                                                {file.courses?.course_title}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-gray-300 text-xs">
                                                {file.profiles?.full_name}
                                            </p>
                                            <p className="text-gray-500 text-xs font-mono">
                                                {file.profiles?.student_id}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                                            {formatBytes(file.file_size)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(file.id)}
                                                    className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-900/20 transition-colors"
                                                    title="View file"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.id, file.file_name)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                                                    title="Delete file"
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