import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn, Eye, EyeOff, BookOpen } from "lucide-react";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import { cn } from "@/utils/cn";

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post("/api/auth/login", form);
            if (!data.success) {
                toast.error(data.message);
                return;
            }

            // Set session in Supabase client
            await supabase.auth.setSession({
                access_token: data.data.access_token,
                refresh_token: data.data.refresh_token,
            });

            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Invalid email or password";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
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
                        Khulna University · Sign in to continue
                    </p>
                </div>

                {/* Card */}
                <div className="card">
                    <h2 className="text-lg font-medium text-gray-100 mb-6">
                        Sign in to your account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, email: e.target.value }))
                                }
                                placeholder="you@ku.ac.bd"
                                className="input-field"
                            />
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
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, password: e.target.value }))
                                    }
                                    placeholder="••••••••"
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

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn("btn-primary w-full mt-2", loading && "opacity-50")}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Sign in
                                </span>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}