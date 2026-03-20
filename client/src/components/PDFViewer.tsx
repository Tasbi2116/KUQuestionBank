import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    X,
    Loader,
    AlertCircle,
    Maximize2,
    Minimize2,
    StickyNote,
} from "lucide-react";
import { cn } from "@/utils/cn";
import NotesPanel from "./NotesPanel";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

interface PDFViewerProps {
    fileId: string;
    url: string;
    fileName: string;
    onClose: () => void;
}

export default function PDFViewer({
    fileId,
    url,
    fileName,
    onClose,
}: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [pageInput, setPageInput] = useState("");
    const [showNotes, setShowNotes] = useState(false);

    const onDocumentLoadSuccess = useCallback(
        ({ numPages }: { numPages: number }) => {
            setNumPages(numPages);
            setLoading(false);
            setError(null);
        },
        []
    );

    const onDocumentLoadError = useCallback((err: Error) => {
        setLoading(false);
        setError(err.message || "Failed to load PDF");
    }, []);

    const goToPrev = () => setPageNumber((p) => Math.max(1, p - 1));
    const goToNext = () => setPageNumber((p) => Math.min(numPages, p + 1));
    const zoomIn = () => setScale((s) => Math.min(3.0, parseFloat((s + 0.25).toFixed(2))));
    const zoomOut = () => setScale((s) => Math.max(0.5, parseFloat((s - 0.25).toFixed(2))));
    const rotate = () => setRotation((r) => (r + 90) % 360);
    const resetZoom = () => setScale(1.0);

    const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const num = parseInt(pageInput, 10);
            if (!isNaN(num) && num >= 1 && num <= numPages) {
                setPageNumber(num);
            }
            setPageInput("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
                {/* File name */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                        {fileName}
                    </p>
                    {!loading && !error && (
                        <p className="text-xs text-gray-500">
                            {numPages} page{numPages !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    {/* Zoom out */}
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                        title="Zoom out"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>

                    {/* Zoom level */}
                    <button
                        onClick={resetZoom}
                        title="Reset zoom"
                        className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors min-w-[52px] text-center font-mono"
                    >
                        {Math.round(scale * 100)}%
                    </button>

                    {/* Zoom in */}
                    <button
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                        title="Zoom in"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <div className="w-px h-5 bg-gray-700 mx-1" />

                    {/* Rotate */}
                    <button
                        onClick={rotate}
                        title="Rotate 90°"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Fullscreen */}
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

                    {/* Notes toggle */}
                    <button
                        onClick={() => setShowNotes((v) => !v)}
                        title="Toggle notes panel"
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            showNotes
                                ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                        )}
                    >
                        <StickyNote className="w-4 h-4" />
                        Notes
                    </button>

                    <div className="w-px h-5 bg-gray-700 mx-1" />

                    {/* Download */}
                    <a
                        href={url}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download PDF"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                    </a>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        title="Close viewer"
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors ml-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Main area: PDF + optional Notes panel ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* PDF area */}
                <div className="flex-1 overflow-auto bg-gray-950 flex items-start justify-center p-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 mt-20 text-gray-400">
                            <Loader className="w-8 h-8 animate-spin text-primary-400" />
                            <p className="text-sm">Loading PDF...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center gap-3 mt-20 max-w-sm text-center">
                            <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <p className="text-gray-300 font-medium">Failed to load PDF</p>
                            <p className="text-gray-500 text-sm">{error}</p>

                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary text-sm mt-2"
                            >
                                <Download className="w-4 h-4" />
                                Download instead
                            </a>
                        </div>
                    )}

                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading=""
                        className={cn(loading || error ? "hidden" : "")}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            rotate={rotation}
                            className="shadow-2xl"
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            loading={
                                <div className="flex items-center justify-center w-[612px] h-[792px] bg-gray-900 rounded">
                                    <Loader className="w-6 h-6 animate-spin text-primary-400" />
                                </div>
                            }
                        />
                    </Document>
                </div>

                {/* Notes panel — slides in from the right */}
                {
                    showNotes && (
                        <div
                            className="w-80 flex-shrink-0 border-l border-gray-800"
                            style={{
                                animation: "slideInRight 0.2s ease-out",
                            }}
                        >
                            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
              }
            `}</style>
                            <NotesPanel
                                fileId={fileId}
                                fileName={fileName}
                                onClose={() => setShowNotes(false)}
                            />
                        </div>
                    )
                }
            </div >

            {/* ── Page navigation ── */}
            {
                !loading && !error && numPages > 0 && (
                    <div className="flex items-center justify-center gap-3 py-3 bg-gray-900 border-t border-gray-800 flex-shrink-0">
                        <button
                            onClick={goToPrev}
                            disabled={pageNumber <= 1}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Page</span>
                            <input
                                type="text"
                                value={pageInput || pageNumber}
                                onChange={(e) => setPageInput(e.target.value)}
                                onKeyDown={handlePageInput}
                                onBlur={() => setPageInput("")}
                                className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                title="Type a page number and press Enter"
                            />
                            <span>of {numPages}</span>
                        </div>

                        <button
                            onClick={goToNext}
                            disabled={pageNumber >= numPages}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )
            }
        </div >
    );
}