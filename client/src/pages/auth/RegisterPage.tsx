import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserPlus, Eye, EyeOff, BookOpen } from "lucide-react";
import api from "@/lib/axios";
import { Department } from "@/types";
import { cn } from "@/utils/cn";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        student_id: "",
        department_id: "",
        password: "",
        confirm_password: "",
    });

    useEffect(() => {
        api
            .get<{ success: boolean; data: Department[] }>("/api/departments")
            .then(({ data }) => {
                if (data.success) setDepartments(data.data);
            });
    }, []);

    const set = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirm_password) {
            toast.error("Passwords do not match");
            return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/register", {
                full_name: form.full_name,
                email: form.email,
                student_id: form.student_id,
                department_id: form.department_id,
                password: form.password,
            });

            if (!data.success) {
                toast.error(data.message);
                return;
            }

            toast.success(
                "Registration successful! Please check your email to verify your account."
            );
            navigate("/login");
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Registration failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4">
                        <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-100">
                        KU Question Bank
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Create your student account
                    </p>
                </div>

                {/* Card */}
                <div className="card">
                    <h2 className="text-lg font-medium text-gray-100 mb-6">
                        Register
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full name */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Full name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.full_name}
                                onChange={set("full_name")}
                                placeholder="Md. Tasbi Hassan"
                                className="input-field"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={set("email")}
                                placeholder="you@ku.ac.bd"
                                className="input-field"
                            />
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Student ID
                            </label>
                            <input
                                type="text"
                                required
                                value={form.student_id}
                                onChange={set("student_id")}
                                placeholder="e.g. 2101012"
                                className="input-field"
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Department
                            </label>
                            <select
                                required
                                value={form.department_id}
                                onChange={set("department_id")}
                                className="input-field"
                            >
                                <option value="">Select your department</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.short_name} — {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={set("password")}
                                    placeholder="Min. 8 characters"
                                    className="input-field pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                required
                                value={form.confirm_password}
                                onChange={set("confirm_password")}
                                placeholder="••••••••"
                                className="input-field"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn("btn-primary w-full mt-2", loading && "opacity-50")}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Create account
                                </span>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}