import { useEffect, useState } from "react";
import { Loader, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import PDFViewer from "./PDFViewer";
import ImageViewer from "./ImageViewer";

interface FileViewerProps {
    fileId: string;
    onClose: () => void;
}

interface FileData {
    id: string;
    file_name: string;
    file_type: string;
    signed_url: string;
}

export default function FileViewer({ fileId, onClose }: FileViewerProps) {
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const { data } = await api.get(`/api/uploads/${fileId}`);
                if (data.success) {
                    setFileData(data.data);
                } else {
                    setError("Failed to load file");
                }
            } catch {
                setError("Failed to load file. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchFile();
    }, [fileId]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader className="w-8 h-8 animate-spin text-primary-400" />
                    <p className="text-sm">Loading file...</p>
                </div>
            </div>
        );
    }

    if (error || !fileData) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center max-w-xs">
                    <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-gray-300 font-medium">Could not open file</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                    <button onClick={onClose} className="btn-secondary text-sm mt-2">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (fileData.file_type === "pdf") {
        return (
            <PDFViewer
                fileId={fileId}
                url={fileData.signed_url}
                fileName={fileData.file_name}
                onClose={onClose}
            />
        );
    }

    return (
        <ImageViewer
            fileId={fileId}
            url={fileData.signed_url}
            fileName={fileData.file_name}
            onClose={onClose}
        />
    );
}