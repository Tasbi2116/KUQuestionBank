import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, BookOpen } from "lucide-react";

type Status = "verifying" | "success" | "error";

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase puts the token in the URL hash — this exchanges it for a session
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    setStatus("error");
                    setMessage(error.message);
                    return;
                }

                if (data.session) {
                    setStatus("success");
                    setMessage("Email verified successfully! Redirecting...");
                    setTimeout(() => navigate("/dashboard"), 2000);
                } else {
                    // Try to parse tokens from URL hash manually
                    const hashParams = new URLSearchParams(
                        window.location.hash.substring(1)
                    );
                    const accessToken = hashParams.get("access_token");
                    const refreshToken = hashParams.get("refresh_token");

                    if (accessToken && refreshToken) {
                        const { error: setError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (setError) {
                            setStatus("error");
                            setMessage(setError.message);
                        } else {
                            setStatus("success");
                            setMessage("Email verified successfully! Redirecting...");
                            setTimeout(() => navigate("/dashboard"), 2000);
                        }
                    } else {
                        setStatus("error");
                        setMessage("Verification link is invalid or has expired.");
                    }
                }
            } catch {
                setStatus("error");
                setMessage("Something went wrong during verification.");
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                {/* Logo */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-6">
                    <BookOpen className="w-7 h-7 text-white" />
                </div>

                <div className="card">
                    {status === "verifying" && (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-100 mb-2">
                                Verifying your email...
                            </h2>
                            <p className="text-sm text-gray-400">
                                Please wait a moment.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="w-12 h-12 text-green-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-100 mb-2">
                                Email Verified!
                            </h2>
                            <p className="text-sm text-gray-400">{message}</p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="flex justify-center mb-4">
                                <XCircle className="w-12 h-12 text-red-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-100 mb-2">
                                Verification Failed
                            </h2>
                            <p className="text-sm text-gray-400 mb-5">{message}</p>
                            <button
                                onClick={() => navigate("/login")}
                                className="btn-primary w-full justify-center"
                            >
                                Back to Sign In
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}