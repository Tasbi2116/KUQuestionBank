import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ChevronRight,
    FolderOpen,
    BookOpen,
    ArrowLeft,
    Upload,
    FileText,
    Image,
    Lock,
} from "lucide-react";
import api from "@/lib/axios";
import { Department } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import { toast } from "react-hot-toast";

interface Course {
    id: string;
    course_code: string;
    course_title: string;
    term: string;
    degree: string;
    course_type: string;
    credit_hours: number;
    is_optional: boolean;
    department_id: string;
}

interface QuestionFile {
    id: string;
    file_name: string;
    file_type: string;
    exam_type: string;
    batch: string;
    description: string;
    file_size: number;
    created_at: string;
    profiles: { full_name: string; student_id: string };
}

type Step = "department" | "degree" | "term" | "course" | "files";

const DEGREES = ["BSc", "MSc"];
const TERMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const EXAM_TYPES = ["Term Final", "Class Test", "Assignment", "Lab Report", "Other"];

export default function BrowsePage() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [files, setFiles] = useState<QuestionFile[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        batch: "",
        exam_type: "Term Final",
        description: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const selectedDept = searchParams.get("dept") ?? "";
    const selectedDegree = searchParams.get("degree") ?? "";
    const selectedTerm = searchParams.get("term") ?? "";
    const selectedCourseId = searchParams.get("course") ?? "";

    const step: Step = !selectedDept
        ? "department"
        : !selectedDegree
            ? "degree"
            : !selectedTerm
                ? "term"
                : !selectedCourseId
                    ? "course"
                    : "files";

    // Check if student can upload to selected department
    const canUpload = profile?.department_id === selectedDept || profile?.role === "admin";

    // Load departments
    useEffect(() => {
        api
            .get<{ success: boolean; data: Department[] }>("/api/departments")
            .then(({ data }) => {
                if (data.success) setDepartments(data.data);
            });
    }, []);

    // Load courses when dept + degree + term selected
    useEffect(() => {
        if (!selectedDept || !selectedDegree || !selectedTerm) return;
        setLoading(true);
        api
            .get<{ success: boolean; data: Course[] }>(
                `/api/courses?department_id=${selectedDept}&degree=${selectedDegree}&term=${selectedTerm}`
            )
            .then(({ data }) => {
                if (data.success) setCourses(data.data);
            })
            .finally(() => setLoading(false));
    }, [selectedDept, selectedDegree, selectedTerm]);

    // Load files when course selected
    useEffect(() => {
        if (!selectedCourseId) return;
        setLoading(true);

        // Find selected course object
        const course = courses.find((c) => c.id === selectedCourseId);
        if (course) setSelectedCourse(course);

        api
            .get<{ success: boolean; data: QuestionFile[] }>(
                `/api/uploads?course_id=${selectedCourseId}`
            )
            .then(({ data }) => {
                if (data.success) setFiles(data.data);
            })
            .finally(() => setLoading(false));
    }, [selectedCourseId, courses]);

    const selectedDeptObj = departments.find((d) => d.id === selectedDept);

    // Handle file upload
    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file");
            return;
        }
        if (!uploadForm.batch) {
            toast.error("Please enter the batch year");
            return;
        }
        if (!canUpload) {
            toast.error("You can only upload to your own department");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("course_id", selectedCourseId);
            formData.append("batch", uploadForm.batch);
            formData.append("exam_type", uploadForm.exam_type);
            formData.append("description", uploadForm.description);

            const { data } = await api.post("/api/uploads", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                toast.success("File uploaded successfully!");
                setSelectedFile(null);
                setUploadForm({ batch: "", exam_type: "Term Final", description: "" });
                // Refresh file list
                const refreshed = await api.get<{
                    success: boolean;
                    data: QuestionFile[];
                }>(`/api/uploads?course_id=${selectedCourseId}`);
                if (refreshed.data.success) setFiles(refreshed.data.data);
            }
        } catch {
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Handle file delete
    const handleDelete = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;
        try {
            await api.delete(`/api/uploads/${fileId}`);
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
            toast.success("File deleted");
        } catch {
            toast.error("Failed to delete file");
        }
    };

    // View/download file
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

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-5 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-gray-100">Browse</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Navigate to find question papers
                </p>
            </div>

            {/* Breadcrumbs */}
            {step !== "department" && (
                <nav className="flex items-center gap-1.5 text-sm flex-wrap">
                    <button
                        onClick={() => setSearchParams({})}
                        className="text-gray-500 hover:text-primary-400 transition-colors"
                    >
                        Departments
                    </button>
                    {selectedDept && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                            <button
                                onClick={() => setSearchParams({ dept: selectedDept })}
                                className={cn(
                                    "transition-colors",
                                    !selectedDegree
                                        ? "text-gray-300 font-medium cursor-default"
                                        : "text-gray-500 hover:text-primary-400"
                                )}
                            >
                                {selectedDeptObj?.short_name}
                            </button>
                        </>
                    )}
                    {selectedDegree && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                            <button
                                onClick={() =>
                                    setSearchParams({ dept: selectedDept, degree: selectedDegree })
                                }
                                className={cn(
                                    "transition-colors",
                                    !selectedTerm
                                        ? "text-gray-300 font-medium cursor-default"
                                        : "text-gray-500 hover:text-primary-400"
                                )}
                            >
                                {selectedDegree}
                            </button>
                        </>
                    )}
                    {selectedTerm && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                            <button
                                onClick={() =>
                                    setSearchParams({
                                        dept: selectedDept,
                                        degree: selectedDegree,
                                        term: selectedTerm,
                                    })
                                }
                                className={cn(
                                    "transition-colors",
                                    !selectedCourseId
                                        ? "text-gray-300 font-medium cursor-default"
                                        : "text-gray-500 hover:text-primary-400"
                                )}
                            >
                                Term {selectedTerm}
                            </button>
                        </>
                    )}
                    {selectedCourseId && selectedCourse && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-gray-300 font-medium">
                                {selectedCourse.course_code}
                            </span>
                        </>
                    )}
                </nav>
            )}

            {/* Back button */}
            {step !== "department" && (
                <button
                    onClick={() => {
                        if (step === "degree") setSearchParams({});
                        else if (step === "term")
                            setSearchParams({ dept: selectedDept });
                        else if (step === "course")
                            setSearchParams({ dept: selectedDept, degree: selectedDegree });
                        else if (step === "files")
                            setSearchParams({
                                dept: selectedDept,
                                degree: selectedDegree,
                                term: selectedTerm,
                            });
                    }}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            )}

            {/* ── Step: Departments ── */}
            {step === "department" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Select a department
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {departments.map((dept) => {
                            const isOwn = profile?.department_id === dept.id;
                            return (
                                <button
                                    key={dept.id}
                                    onClick={() => setSearchParams({ dept: dept.id })}
                                    className={cn(
                                        "card text-left hover:border-primary-700 hover:bg-gray-800/50 transition-colors group relative",
                                        isOwn && "border-primary-700/50"
                                    )}
                                >
                                    {isOwn && (
                                        <span className="absolute top-2 right-2 text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded-full">
                                            Mine
                                        </span>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                                            <FolderOpen className="w-4 h-4 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-100 group-hover:text-primary-400 transition-colors">
                                                {dept.short_name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[160px]">
                                                {dept.name}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Step: Degree ── */}
            {step === "degree" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Select degree — {selectedDeptObj?.name}
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-xs">
                        {DEGREES.map((deg) => (
                            <button
                                key={deg}
                                onClick={() =>
                                    setSearchParams({ dept: selectedDept, degree: deg })
                                }
                                className="card text-center hover:border-primary-700 hover:bg-gray-800/50 transition-colors group py-8"
                            >
                                <BookOpen className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-100 group-hover:text-primary-400 transition-colors">
                                    {deg}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Step: Term ── */}
            {step === "term" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Select term — {selectedDeptObj?.short_name} {selectedDegree}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {TERMS.map((term) => {
                            const [year, t] = term.split("-");
                            return (
                                <button
                                    key={term}
                                    onClick={() =>
                                        setSearchParams({
                                            dept: selectedDept,
                                            degree: selectedDegree,
                                            term,
                                        })
                                    }
                                    className="card text-center hover:border-primary-700 hover:bg-gray-800/50 transition-colors group py-6"
                                >
                                    <p className="text-lg font-semibold text-primary-400">
                                        {term}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Year {year}, Term {t}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Step: Courses ── */}
            {step === "course" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        {loading
                            ? "Loading courses..."
                            : `${courses.length} courses — Term ${selectedTerm}`}
                    </p>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="card text-center py-10">
                            <p className="text-gray-500">No courses found for this selection.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {courses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() =>
                                        setSearchParams({
                                            dept: selectedDept,
                                            degree: selectedDegree,
                                            term: selectedTerm,
                                            course: course.id,
                                        })
                                    }
                                    className="card w-full text-left flex items-center justify-between hover:border-primary-700 hover:bg-gray-800/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-4 h-4 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-100 group-hover:text-primary-400 transition-colors">
                                                {course.course_title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {course.course_code} · {course.credit_hours} cr ·{" "}
                                                <span className="capitalize">{course.course_type}</span>
                                                {course.is_optional && (
                                                    <span className="ml-1.5 text-amber-500">
                                                        Elective
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Step: Files (course detail) ── */}
            {step === "files" && selectedCourse && (
                <div className="space-y-5">
                    {/* Course info */}
                    <div className="card">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-100">
                                    {selectedCourse.course_title}
                                </h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {selectedCourse.course_code} · {selectedDegree} · Term{" "}
                                    {selectedTerm} · {selectedDeptObj?.short_name}
                                </p>
                            </div>
                            <span className="text-xs bg-primary-600/20 text-primary-400 px-2.5 py-1 rounded-full capitalize flex-shrink-0">
                                {selectedCourse.course_type}
                            </span>
                        </div>
                    </div>

                    {/* Upload section — only if student belongs to this department */}
                    {canUpload ? (
                        <div className="card space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-primary-400" />
                                Upload Question Paper
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">
                                        Batch year <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadForm.batch}
                                        onChange={(e) =>
                                            setUploadForm((f) => ({ ...f, batch: e.target.value }))
                                        }
                                        placeholder="e.g. 21"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">
                                        Exam type <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={uploadForm.exam_type}
                                        onChange={(e) =>
                                            setUploadForm((f) => ({
                                                ...f,
                                                exam_type: e.target.value,
                                            }))
                                        }
                                        className="input-field"
                                    >
                                        {EXAM_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">
                                    Description (optional)
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.description}
                                    onChange={(e) =>
                                        setUploadForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Mid semester class test 2023"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">
                                    File <span className="text-red-400">*</span>
                                    <span className="ml-1 text-gray-600">
                                        (PDF, JPG, PNG, WebP — max 10MB)
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) =>
                                        setSelectedFile(e.target.files?.[0] ?? null)
                                    }
                                    className="block w-full text-sm text-gray-400
                    file:mr-3 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary-600 file:text-white
                    hover:file:bg-primary-700
                    file:cursor-pointer file:transition-colors"
                                />
                                {selectedFile && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Selected: {selectedFile.name} (
                                        {formatBytes(selectedFile.size)})
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile}
                                className={cn(
                                    "btn-primary",
                                    (uploading || !selectedFile) && "opacity-50"
                                )}
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Upload
                                    </span>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Upload restricted notice */
                        <div className="card flex items-center gap-3 border-amber-700/30 bg-amber-900/10">
                            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-300">
                                    Upload restricted
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    You can only upload question papers for your own department (
                                    {departments.find((d) => d.id === profile?.department_id)
                                        ?.short_name ?? "your department"}
                                    ).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Files list */}
                    <div>
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                            {loading
                                ? "Loading files..."
                                : `${files.length} question paper${files.length !== 1 ? "s" : ""} available`}
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : files.length === 0 ? (
                            <div className="card text-center py-10">
                                <FolderOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No files yet</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {canUpload
                                        ? "Be the first to upload a question paper for this course."
                                        : "No question papers have been uploaded for this course yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="card flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                                                {file.file_type === "pdf" ? (
                                                    <FileText className="w-4 h-4 text-primary-400" />
                                                ) : (
                                                    <Image className="w-4 h-4 text-primary-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-100 truncate">
                                                    {file.file_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {file.exam_type} · Batch {file.batch} ·{" "}
                                                    {formatBytes(file.file_size)} · by{" "}
                                                    {file.profiles?.full_name ?? "Unknown"}
                                                </p>
                                                {file.description && (
                                                    <p className="text-xs text-gray-600 mt-0.5">
                                                        {file.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleView(file.id)}
                                                className="text-xs btn-secondary py-1.5 px-3"
                                            >
                                                View
                                            </button>
                                            {(profile?.role === "admin") && (
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    className="text-xs text-red-400 hover:text-red-300 transition-colors px-2"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}