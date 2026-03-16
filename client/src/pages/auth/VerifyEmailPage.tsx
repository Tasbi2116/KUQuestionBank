import { BookOpen, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4">
                    <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="card mt-4">
                    <div className="flex justify-center mb-4">
                        <MailCheck className="w-12 h-12 text-primary-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-2">
                        Check your email
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        We've sent a verification link to your email address. Please click
                        it to activate your account before signing in.
                    </p>
                    <Link to="/login" className="btn-primary w-full justify-center">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}