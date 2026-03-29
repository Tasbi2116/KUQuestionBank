import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn, Eye, EyeOff, BookOpen, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/utils/cn";

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const justVerified = searchParams.get("verified") === "true";

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // If already logged in redirect to dashboard
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate("/dashboard", { replace: true });
        });
    }, [navigate]);

    // Replace history so browser back from login goes to landing page
    useEffect(() => {
        window.history.replaceState(null, "", "/login");
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Login directly via Supabase client — no backend needed
            // This avoids the lock conflict from setSession()
            const { data, error } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });

            if (error) {
                if (
                    error.message.toLowerCase().includes("email not confirmed") ||
                    error.message.toLowerCase().includes("not confirmed")
                ) {
                    toast.error(
                        "Please verify your email first. Check your inbox."
                    );
                    return;
                }
                toast.error("Invalid email or password");
                return;
            }

            if (!data.session) {
                toast.error("Login failed. Please try again.");
                return;
            }

            toast.success("Welcome back!");
            navigate("/dashboard", { replace: true });
        } catch {
            toast.error("Something went wrong. Please try again.");
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

                {/* Verified banner */}
                {justVerified && (
                    <div className="flex items-center gap-3 bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-3 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-300">
                            Email verified successfully! You can now sign in.
                        </p>
                    </div>
                )}

                {/* Card */}
                <div className="card">
                    <h2 className="text-lg font-medium text-gray-100 mb-6">
                        Sign in to your account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="you@gmail.com"
                                className="input-field"
                            />
                        </div>

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