import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, BookOpen } from "lucide-react";

type Status = "verifying" | "success" | "error";

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("");
    const hasRun = useRef(false);

    useEffect(() => {
        // Prevent double execution
        if (hasRun.current) return;
        hasRun.current = true;

        const handleCallback = async () => {
            try {
                // Give Supabase a moment to process the URL hash
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Supabase automatically parses the token from URL hash
                // Just call getSession — it picks up the token from the URL
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    console.error("[Callback] getSession error:", error.message);
                    setStatus("error");
                    setMessage(error.message);
                    return;
                }

                if (session) {
                    // Verified — sign out so they log in manually (security best practice)
                    await supabase.auth.signOut();
                    setStatus("success");
                    setMessage(
                        "Your email has been verified successfully. Please sign in to continue."
                    );
                    setTimeout(() => navigate("/login?verified=true"), 3000);
                    return;
                }

                // No session from getSession — try exchanging code from URL
                const url = new URL(window.location.href);

                // Check for error in URL params (Supabase puts errors here)
                const errorParam = url.searchParams.get("error");
                const errorDescription = url.searchParams.get("error_description");

                if (errorParam) {
                    setStatus("error");
                    setMessage(errorDescription ?? errorParam);
                    return;
                }

                // Try code exchange (PKCE flow)
                const code = url.searchParams.get("code");
                if (code) {
                    const { error: exchangeError } =
                        await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        setStatus("error");
                        setMessage(exchangeError.message);
                        return;
                    }

                    await supabase.auth.signOut();
                    setStatus("success");
                    setMessage(
                        "Your email has been verified successfully. Please sign in to continue."
                    );
                    setTimeout(() => navigate("/login?verified=true"), 3000);
                    return;
                }

                // Try hash-based token (implicit flow)
                const hash = window.location.hash;
                if (hash && hash.includes("access_token")) {
                    const hashParams = new URLSearchParams(hash.substring(1));
                    const accessToken = hashParams.get("access_token");
                    const refreshToken = hashParams.get("refresh_token");

                    if (accessToken && refreshToken) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (sessionError) {
                            setStatus("error");
                            setMessage(sessionError.message);
                            return;
                        }

                        await supabase.auth.signOut();
                        setStatus("success");
                        setMessage(
                            "Your email has been verified successfully. Please sign in to continue."
                        );
                        setTimeout(() => navigate("/login?verified=true"), 3000);
                        return;
                    }
                }

                // Nothing worked
                setStatus("error");
                setMessage(
                    "Verification link is invalid or has expired. Please register again."
                );
            } catch (err) {
                console.error("[Callback] unexpected error:", err);
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
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
                            <p className="text-sm text-gray-400">Please wait a moment.</p>
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
                            <p className="text-sm text-gray-400 mb-5">{message}</p>
                            <button
                                onClick={() => navigate("/login?verified=true")}
                                className="btn-primary w-full justify-center"
                            >
                                Go to Sign In
                            </button>
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
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="btn-primary w-full justify-center"
                                >
                                    Go to Sign In
                                </button>
                                <button
                                    onClick={() => navigate("/register")}
                                    className="btn-secondary w-full justify-center"
                                >
                                    Register Again
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}