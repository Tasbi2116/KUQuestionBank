import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Search,
    FileText,
    Image,
    FolderOpen,
    X,
    SlidersHorizontal,
    BookOpen,
    Clock,
} from "lucide-react";
import api from "@/lib/axios";
import { Department } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { cn } from "@/utils/cn";

interface SearchResult {
    id: string;
    file_name: string;
    file_type: string;
    exam_type: string;
    batch: string;
    description: string;
    file_size: number;
    created_at: string;
    uploaded_by: string;
    course_id: string;
    rank: number;
    course_code: string;
    course_title: string;
    term: string;
    degree: string;
    department_id: string;
    dept_short: string;
    uploader_name: string;
    student_id: string;
}

const DEGREES = ["BSc", "BSc(OBE)", "MSc"];

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function SearchPage() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialQuery = searchParams.get("q") ?? "";

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filterDept, setFilterDept] = useState("");
    const [filterDegree, setFilterDegree] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedQuery = useDebounce(query, 400);

    // Load departments for filter
    useEffect(() => {
        api
            .get<{ success: boolean; data: Department[] }>("/api/departments")
            .then(({ data }) => {
                if (data.success) setDepartments(data.data);
            });

        // Auto-focus search input
        inputRef.current?.focus();
    }, []);

    // Run search when debounced query or filters change
    const runSearch = useCallback(async (
        q: string,
        dept: string,
        degree: string
    ) => {
        if (!q.trim() || q.trim().length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const params = new URLSearchParams({ q: q.trim() });
            if (dept) params.append("dept", dept);
            if (degree) params.append("degree", degree);

            const { data } = await api.get<{
                success: boolean;
                data: { query: string; results: SearchResult[]; count: number };
            }>(`/api/search?${params.toString()}`);

            if (data.success) {
                setResults(data.data.results);
                // Update URL so search is shareable/bookmarkable
                setSearchParams({ q: q.trim(), ...(dept && { dept }), ...(degree && { degree }) });
            }
        } catch {
            toast.error("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [setSearchParams]);

    useEffect(() => {
        runSearch(debouncedQuery, filterDept, filterDegree);
    }, [debouncedQuery, filterDept, filterDegree, runSearch]);

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

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setHasSearched(false);
        setSearchParams({});
        inputRef.current?.focus();
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Highlight matched text
    const highlight = (text: string, q: string) => {
        if (!q.trim() || !text) return text;
        const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escaped})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark
                    key={i}
                    style={{
                        background: "rgba(99,102,241,0.25)",
                        color: "inherit",
                        borderRadius: "2px",
                        padding: "0 1px",
                    }}
                >
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const recentSearches = ["Machine Learning", "Algorithms", "Database Systems", "Computer Networks"];

    return (
        <div className="max-w-4xl space-y-5 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary-400" />
                    Search
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Search across all question papers, courses and departments
                </p>
            </div>

            {/* Search bar */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by course name, code, exam type, batch..."
                        className="input-field pl-11 pr-24 py-3.5 text-base"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {query && (
                            <button
                                onClick={clearSearch}
                                className="text-gray-500 hover:text-gray-300 p-1 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters((v) => !v)}
                            className={cn(
                                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                                showFilters
                                    ? "bg-primary-600/20 border-primary-600/40 text-primary-400"
                                    : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                            )}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Filters
                            {(filterDept || filterDegree) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Filters panel */}
                {showFilters && (
                    <div className="card animate-scale-in flex flex-wrap gap-4 py-4">
                        <div className="flex-1 min-w-40">
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Department
                            </label>
                            <select
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All departments</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.short_name} — {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-32">
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Degree
                            </label>
                            <select
                                value={filterDegree}
                                onChange={(e) => setFilterDegree(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All degrees</option>
                                {DEGREES.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        {(filterDept || filterDegree) && (
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setFilterDept(""); setFilterDegree(""); }}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 pb-2"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center gap-3 text-gray-400 py-4">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Searching...</span>
                </div>
            )}

            {/* Empty state — before any search */}
            {!hasSearched && !loading && (
                <div className="space-y-4">
                    <div className="card text-center py-10">
                        <Search className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">
                            Search across all question papers
                        </p>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                            Try searching by course name, course code, batch year, or exam type
                        </p>
                    </div>

                    {/* Suggested searches */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Try searching for
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setQuery(s)}
                                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-primary-600/50 hover:text-primary-400 hover:bg-primary-600/10 transition-all duration-150"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No results */}
            {hasSearched && !loading && results.length === 0 && (
                <div className="card text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No results found</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Try a different search term or remove filters
                    </p>
                    {(filterDept || filterDegree) && (
                        <button
                            onClick={() => { setFilterDept(""); setFilterDegree(""); }}
                            className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            Clear filters and try again
                        </button>
                    )}
                </div>
            )}

            {/* Results */}
            {hasSearched && !loading && results.length > 0 && (
                <div className="space-y-3">
                    {/* Result count */}
                    <p className="text-sm text-gray-400">
                        <span className="text-gray-100 font-medium">{results.length}</span>{" "}
                        result{results.length !== 1 ? "s" : ""} for{" "}
                        <span className="text-primary-400">"{debouncedQuery}"</span>
                        {filterDept && (
                            <span className="ml-1">
                                in{" "}
                                <span className="text-gray-300">
                                    {departments.find((d) => d.id === filterDept)?.short_name}
                                </span>
                            </span>
                        )}
                    </p>

                    {/* Result cards */}
                    <div className="space-y-2">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="card hover:border-gray-600 transition-all duration-200 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: file info */}
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {result.file_type === "pdf" ? (
                                                <FileText className="w-4 h-4 text-primary-400" />
                                            ) : (
                                                <Image className="w-4 h-4 text-teal-400" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {/* File name with highlight */}
                                            <p className="text-sm font-medium text-gray-100 truncate">
                                                {highlight(result.file_name, debouncedQuery)}
                                            </p>

                                            {/* Course info */}
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                <span className="text-primary-400 font-medium">
                                                    {highlight(result.course_code, debouncedQuery)}
                                                </span>
                                                {" · "}
                                                {highlight(result.course_title, debouncedQuery)}
                                            </p>

                                            {/* Metadata row */}
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                                    {result.dept_short}
                                                </span>
                                                <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                                    {result.degree}
                                                </span>
                                                <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                                    Term {result.term}
                                                </span>
                                                <span className="text-xs text-amber-400 bg-amber-900/20 border border-amber-800/30 px-2 py-0.5 rounded-full">
                                                    {highlight(result.exam_type, debouncedQuery)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Batch{" "}
                                                    <span className="text-gray-300">
                                                        {highlight(result.batch, debouncedQuery)}
                                                    </span>
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {formatBytes(result.file_size)}
                                                </span>
                                            </div>

                                            {/* Description if exists */}
                                            {result.description && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    {highlight(result.description, debouncedQuery)}
                                                </p>
                                            )}

                                            {/* Uploader + date */}
                                            <p className="text-xs text-gray-600 mt-1.5">
                                                Uploaded by{" "}
                                                <span className="text-gray-500">
                                                    {result.uploader_name}
                                                </span>{" "}
                                                · {formatDate(result.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: actions */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleView(result.id)}
                                            className="btn-primary text-xs py-1.5 px-3"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/browse?dept=${result.department_id}&degree=${result.degree}&term=${result.term}&course=${result.course_id}`
                                                )
                                            }
                                            className="btn-secondary text-xs py-1.5 px-3"
                                        >
                                            <BookOpen className="w-3.5 h-3.5" />
                                            Browse
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}