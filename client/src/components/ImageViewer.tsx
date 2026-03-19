import { useState } from "react";
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    X,
    Minimize2,
    Maximize2,
} from "lucide-react";

interface ImageViewerProps {
    url: string;
    fileName: string;
    onClose: () => void;
}

export default function ImageViewer({
    url,
    fileName,
    onClose,
}: ImageViewerProps) {
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);

    const zoomIn = () => setScale((s) => Math.min(4.0, parseFloat((s + 0.25).toFixed(2))));
    const zoomOut = () => setScale((s) => Math.max(0.25, parseFloat((s - 0.25).toFixed(2))));
    const rotate = () => setRotation((r) => (r + 90) % 360);
    const resetZoom = () => setScale(1.0);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                        {fileName}
                    </p>
                    <p className="text-xs text-gray-500">Image</p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.25}
                        title="Zoom out"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>

                    <button
                        onClick={resetZoom}
                        title="Reset zoom"
                        className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors min-w-[52px] text-center font-mono"
                    >
                        {Math.round(scale * 100)}%
                    </button>

                    <button
                        onClick={zoomIn}
                        disabled={scale >= 4.0}
                        title="Zoom in"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <div className="w-px h-5 bg-gray-700 mx-1" />

                    <button
                        onClick={rotate}
                        title="Rotate 90°"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setFullscreen((v) => !v)}
                        title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
                    >
                        {fullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </button>

                    <div className="w-px h-5 bg-gray-700 mx-1" />


                    <a
                        href={url}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download image"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                    </a>

                    <button
                        onClick={onClose}
                        title="Close viewer"
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors ml-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Image area */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-950">
                <img
                    src={url}
                    alt={fileName}
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        transition: "transform 0.2s ease",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        borderRadius: "4px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
                    }}
                />
            </div>
        </div >
    );
}