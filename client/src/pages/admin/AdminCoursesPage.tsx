import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, Search, Filter } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
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
    department_id: string;
    departments?: { short_name: string; name: string };
}

const TERMS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const DEGREES = ["BSc", "MSc"];
const COURSE_TYPES = ["theory", "lab", "project", "thesis", "elective"];

export default function AdminCoursesPage() {
    const { profile } = useAuth();
    const actorRole = profile?.role ?? "student";
    const isFullAdmin = actorRole === "admin";
    const actorDeptId = profile?.department_id ?? "";

    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filtered, setFiltered] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [filterTerm, setFilterTerm] = useState("");

    const [form, setForm] = useState({
        department_id: isFullAdmin ? "" : actorDeptId,
        degree: "BSc",
        term: "1-1",
        course_code: "",
        course_title: "",
        credit_hours: 3,
        course_type: "theory",
        is_optional: false,
    });

    useEffect(() => {
        const init = async () => {
            try {
                const coursesUrl = isFullAdmin
                    ? "/api/courses"
                    : `/api/courses?department_id=${actorDeptId}`;

                const [coursesRes, deptsRes] = await Promise.all([
                    api.get<{ success: boolean; data: Course[] }>(coursesUrl),
                    api.get<{ success: boolean; data: Department[] }>("/api/departments"),
                ]);
                if (coursesRes.data.success) setCourses(coursesRes.data.data);
                if (deptsRes.data.success) setDepartments(deptsRes.data.data);
            } catch {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [isFullAdmin, actorDeptId]);

    useEffect(() => {
        let result = courses;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.course_title.toLowerCase().includes(q) ||
                    c.course_code.toLowerCase().includes(q)
            );
        }
        if (filterDept) result = result.filter((c) => c.department_id === filterDept);
        if (filterTerm) result = result.filter((c) => c.term === filterTerm);
        setFiltered(result);
    }, [search, filterDept, filterTerm, courses]);

    const handleCreate = async () => {
        if (
            !form.department_id ||
            !form.course_code.trim() ||
            !form.course_title.trim()
        ) {
            toast.error("Department, course code and title are required");
            return;
        }
        setSaving(true);
        try {
            const { data } = await api.post("/api/courses", {
                ...form,
                credit_hours: Number(form.credit_hours),
            });
            if (data.success) {
                setCourses((prev) => [...prev, data.data as Course]);
                setForm({
                    department_id: isFullAdmin ? "" : actorDeptId,
                    degree: "BSc",
                    term: "1-1",
                    course_code: "",
                    course_title: "",
                    credit_hours: 3,
                    course_type: "theory",
                    is_optional: false,
                });
                setShowForm(false);
                toast.success("Course created");
            }
        } catch {
            toast.error("Failed to create course");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course: Course) => {
        if (
            !window.confirm(
                `Delete "${course.course_title}"? All uploaded files for this course will also be deleted.`
            )
        )
            return;
        try {
            await api.delete(`/api/courses/${course.id}`);
            setCourses((prev) => prev.filter((c) => c.id !== course.id));
            toast.success("Course deleted");
        } catch {
            toast.error("Failed to delete course");
        }
    };

    const setF =
        (field: string) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm((f) => ({ ...f, [field]: e.target.value }));

    return (
        <div className="space-y-5 max-w-5xl animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-400" />
                        Courses
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {courses.length} {isFullAdmin ? "total" : "department"} courses
                    </p>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Add Course
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="card space-y-4 animate-scale-in">
                    <h3 className="text-sm font-medium text-gray-200">New Course</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Department — only full admin can choose */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Department
                            </label>
                            {isFullAdmin ? (
                                <select
                                    value={form.department_id}
                                    onChange={setF("department_id")}
                                    className="input-field"
                                >
                                    <option value="">Select department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.short_name} — {d.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={
                                        departments.find((d) => d.id === actorDeptId)?.name ?? ""
                                    }
                                    disabled
                                    className="input-field opacity-50 cursor-not-allowed"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Degree
                            </label>
                            <select
                                value={form.degree}
                                onChange={setF("degree")}
                                className="input-field"
                            >
                                {DEGREES.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Term
                            </label>
                            <select
                                value={form.term}
                                onChange={setF("term")}
                                className="input-field"
                            >
                                {TERMS.map((t) => (
                                    <option key={t} value={t}>Term {t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Course code
                            </label>
                            <input
                                type="text"
                                value={form.course_code}
                                onChange={setF("course_code")}
                                placeholder="e.g. CSE 3101"
                                className="input-field"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Course title
                            </label>
                            <input
                                type="text"
                                value={form.course_title}
                                onChange={setF("course_title")}
                                placeholder="e.g. Database Systems"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Credit hours
                            </label>
                            <input
                                type="number"
                                value={form.credit_hours}
                                onChange={setF("credit_hours")}
                                min={0.5}
                                max={6}
                                step={0.25}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">
                                Course type
                            </label>
                            <select
                                value={form.course_type}
                                onChange={setF("course_type")}
                                className="input-field"
                            >
                                {COURSE_TYPES.map((t) => (
                                    <option key={t} value={t} className="capitalize">{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 sm:col-span-2">
                            <input
                                type="checkbox"
                                id="is_optional"
                                checked={form.is_optional}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, is_optional: e.target.checked }))
                                }
                                className="w-4 h-4 rounded"
                            />
                            <label htmlFor="is_optional" className="text-sm text-gray-400">
                                This is an elective/optional course
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={saving}
                            className={cn("btn-primary", saving && "opacity-50")}
                        >
                            {saving ? "Saving..." : "Create Course"}
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

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="input-field pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    {isFullAdmin && (
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All departments</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.short_name}</option>
                            ))}
                        </select>
                    )}
                    <select
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        className="input-field"
                    >
                        <option value="">All terms</option>
                        {TERMS.map((t) => (
                            <option key={t} value={t}>Term {t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Courses table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-10">
                    <p className="text-gray-500">No courses found</p>
                </div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Dept
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Term
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Type
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((course) => (
                                    <tr
                                        key={course.id}
                                        className="hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-gray-100 font-medium">
                                                {course.course_title}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">
                                                {course.course_code}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                                            {course.departments?.short_name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                                            {course.term}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                                                {course.course_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(course)}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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