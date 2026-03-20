import { useEffect, useState, useCallback } from "react";
import {
    StickyNote,
    Save,
    Trash2,
    X,
    Loader,
    CheckCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { cn } from "@/utils/cn";

interface Note {
    id: string;
    content: string;
    updated_at: string;
}

interface NotesPanelProps {
    fileId: string;
    fileName: string;
    onClose: () => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function NotesPanel({
    fileId,
    fileName,
    onClose,
}: NotesPanelProps) {
    const [note, setNote] = useState<Note | null>(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [deleting, setDeleting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Load existing note for this file
    useEffect(() => {
        const fetchNote = async () => {
            try {
                const { data } = await api.get<{
                    success: boolean;
                    data: Note | null;
                }>(`/api/notes?question_file_id=${fileId}`);
                if (data.success && data.data) {
                    setNote(data.data);
                    setContent(data.data.content);
                }
            } catch {
                // No note exists yet — that is fine
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [fileId]);

    // Track unsaved changes
    useEffect(() => {
        const savedContent = note?.content ?? "";
        setIsDirty(content.trim() !== savedContent.trim());
    }, [content, note]);

    // Auto-save after 2 seconds of inactivity
    useEffect(() => {
        if (!isDirty || content.trim() === "") return;
        const timer = setTimeout(() => {
            handleSave(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [content, isDirty]);

    const handleSave = useCallback(
        async (isAutoSave = false) => {
            if (!content.trim()) return;
            if (!isDirty && !isAutoSave) return;

            setSaveStatus("saving");
            try {
                const { data } = await api.post<{
                    success: boolean;
                    data: Note;
                }>("/api/notes", {
                    question_file_id: fileId,
                    content: content.trim(),
                });

                if (data.success) {
                    setNote(data.data);
                    setIsDirty(false);
                    setSaveStatus("saved");
                    if (!isAutoSave) toast.success("Note saved");
                    // Reset saved indicator after 2 seconds
                    setTimeout(() => setSaveStatus("idle"), 2000);
                }
            } catch {
                setSaveStatus("error");
                if (!isAutoSave) toast.error("Failed to save note");
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        },
        [content, fileId, isDirty]
    );

    const handleDelete = async () => {
        if (!note) return;
        if (!window.confirm("Delete this note? This cannot be undone.")) return;

        setDeleting(true);
        try {
            await api.delete(`/api/notes/${note.id}`);
            setNote(null);
            setContent("");
            setIsDirty(false);
            toast.success("Note deleted");
        } catch {
            toast.error("Failed to delete note");
        } finally {
            setDeleting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl+S to save
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            handleSave(false);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <StickyNote className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-200">My Notes</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* File name context */}
            <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-950/50 flex-shrink-0">
                <p className="text-xs text-gray-500 truncate" title={fileName}>
                    {fileName}
                </p>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
                {loading ? (
                    <div className="flex items-center justify-center flex-1">
                        <Loader className="w-5 h-5 animate-spin text-amber-400" />
                    </div>
                ) : (
                    <>
                        {/* Textarea */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                "Write your private notes here...\n\nIdeas:\n• Mark important topics\n• Note which years this appeared\n• Write down hints for solving"
                            }
                            className="flex-1 w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-sm text-gray-100 placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-600/50 transition-all leading-relaxed"
                            style={{ minHeight: "200px" }}
                        />

                        {/* Save status indicator */}
                        <div className="flex items-center justify-between gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1.5 text-xs">
                                {saveStatus === "saving" && (
                                    <span className="flex items-center gap-1.5 text-gray-500">
                                        <Loader className="w-3.5 h-3.5 animate-spin" />
                                        Saving...
                                    </span>
                                )}
                                {saveStatus === "saved" && (
                                    <span className="flex items-center gap-1.5 text-green-400">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Saved
                                    </span>
                                )}
                                {saveStatus === "error" && (
                                    <span className="text-red-400">Save failed</span>
                                )}
                                {saveStatus === "idle" && isDirty && content.trim() && (
                                    <span className="text-gray-600">Unsaved changes</span>
                                )}
                                {saveStatus === "idle" && !isDirty && note && (
                                    <span className="text-gray-600">
                                        Last saved {formatDate(note.updated_at)}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Delete button — only shown if note exists */}
                                {note && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                        title="Delete note"
                                    >
                                        {deleting ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                )}

                                {/* Save button */}
                                <button
                                    onClick={() => handleSave(false)}
                                    disabled={
                                        !content.trim() ||
                                        !isDirty ||
                                        saveStatus === "saving"
                                    }
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                        content.trim() && isDirty && saveStatus !== "saving"
                                            ? "bg-amber-600 text-white hover:bg-amber-700"
                                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    )}
                                    title="Save note (Ctrl+S)"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-gray-800 flex-shrink-0">
                <p className="text-xs text-gray-600 text-center">
                    Notes are private — only visible to you · Ctrl+S to save
                </p>
            </div>
        </div>
    );
}