import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Trash2, FileText, Image } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

interface BookmarkItem {
    id: string;
    created_at: string;
    question_files: {
        id: string;
        file_name: string;
        file_type: string;
        exam_type: string;
        batch: string;
        created_at: string;
        courses: {
            course_code: string;
            course_title: string;
            term: string;
        };
    };
}

export default function BookmarksPage() {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async () => {
        try {
            const { data } =
                await api.get<{ success: boolean; data: BookmarkItem[] }>(
                    "/api/bookmarks"
                );
            if (data.success) setBookmarks(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const handleRemove = async (id: string) => {
        try {
            await api.delete(`/api/bookmarks/${id}`);
            setBookmarks((prev) => prev.filter((b) => b.id !== id));
            toast.success("Bookmark removed");
        } catch {
            toast.error("Failed to remove bookmark");
        }
    };

    return (
        <div className="max-w-3xl space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-gray-100">Bookmarks</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Your saved question papers
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : bookmarks.length === 0 ? (
                <div className="card text-center py-12">
                    <Bookmark className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No bookmarks yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Browse question papers and bookmark the ones you want to revisit.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {bookmarks.map((bm) => {
                        const file = bm.question_files;
                        return (
                            <div
                                key={bm.id}
                                className="card flex items-center justify-between gap-4 group"
                            >
                                <button
                                    className="flex items-center gap-3 flex-1 text-left"
                                    onClick={() =>
                                        navigate(`/browse/file/${file.id}`)
                                    }
                                >
                                    <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                                        {file.file_type === "pdf" ? (
                                            <FileText className="w-4 h-4 text-primary-400" />
                                        ) : (
                                            <Image className="w-4 h-4 text-primary-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-100 group-hover:text-primary-400 transition-colors">
                                            {file.file_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {file.courses?.course_code} · {file.exam_type} · Batch{" "}
                                            {file.batch} · Term {file.courses?.term}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleRemove(bm.id)}
                                    className="text-gray-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                                    title="Remove bookmark"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}