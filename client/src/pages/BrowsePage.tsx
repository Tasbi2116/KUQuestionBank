import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, FolderOpen, BookOpen, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { Department } from "@/types";
import { cn } from "@/utils/cn";

interface Course {
    id: string;
    course_code: string;
    course_title: string;
    term: string;
    degree: string;
    course_type: string;
    credit_hours: number;
    is_optional: boolean;
}

type Step = "department" | "degree" | "term" | "course";

const DEGREES = ["BSc", "MSc"];
const TERMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];

export default function BrowsePage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    const selectedDept = searchParams.get("dept") ?? "";
    const selectedDegree = searchParams.get("degree") ?? "";
    const selectedTerm = searchParams.get("term") ?? "";

    // Determine current step
    const step: Step = !selectedDept
        ? "department"
        : !selectedDegree
            ? "degree"
            : !selectedTerm
                ? "term"
                : "course";

    // Load departments once
    useEffect(() => {
        api
            .get<{ success: boolean; data: Department[] }>("/api/departments")
            .then(({ data }) => {
                if (data.success) setDepartments(data.data);
            });
    }, []);

    // Load courses when dept + degree + term are selected
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

    const selectedDeptObj = departments.find((d) => d.id === selectedDept);

    // Breadcrumbs
    const crumbs = [
        { label: "Departments", onClick: () => setSearchParams({}) },
        ...(selectedDept
            ? [
                {
                    label: selectedDeptObj?.short_name ?? "...",
                    onClick: () => setSearchParams({ dept: selectedDept }),
                },
            ]
            : []),
        ...(selectedDegree
            ? [
                {
                    label: selectedDegree,
                    onClick: () =>
                        setSearchParams({ dept: selectedDept, degree: selectedDegree }),
                },
            ]
            : []),
        ...(selectedTerm ? [{ label: `Term ${selectedTerm}`, onClick: () => { } }] : []),
    ];

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
            {crumbs.length > 1 && (
                <nav className="flex items-center gap-1.5 text-sm">
                    {crumbs.map((crumb, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-600" />}
                            <button
                                onClick={crumb.onClick}
                                className={cn(
                                    "transition-colors",
                                    i === crumbs.length - 1
                                        ? "text-gray-300 font-medium cursor-default"
                                        : "text-gray-500 hover:text-primary-400"
                                )}
                            >
                                {crumb.label}
                            </button>
                        </span>
                    ))}
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
                    }}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            )}

            {/* Step: Departments */}
            {step === "department" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Select a department
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {departments.map((dept) => (
                            <button
                                key={dept.id}
                                onClick={() => setSearchParams({ dept: dept.id })}
                                className="card text-left hover:border-primary-700 hover:bg-gray-800/50 transition-colors group"
                            >
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
                        ))}
                    </div>
                </div>
            )}

            {/* Step: Degree */}
            {step === "degree" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Select a degree — {selectedDeptObj?.name}
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

            {/* Step: Term */}
            {step === "term" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Select a term — {selectedDeptObj?.short_name} {selectedDegree}
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

            {/* Step: Courses */}
            {step === "course" && (
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        {loading ? "Loading courses..." : `${courses.length} courses found`}
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
                                        navigate(
                                            `/browse/course/${course.id}?dept=${selectedDept}&degree=${selectedDegree}&term=${selectedTerm}`
                                        )
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
                                                    <span className="ml-1.5 text-amber-500">Elective</span>
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
        </div>
    );
}