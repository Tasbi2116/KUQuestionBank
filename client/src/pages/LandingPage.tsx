import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Upload,
    Search,
    Shield,
    Bookmark,
    FileText,
    ChevronRight,
    Github,
    Facebook,
    Mail,
    GraduationCap,
    Users,
    FolderOpen,
    Star,
    ArrowRight,
    CheckCircle,
    Building2,
} from "lucide-react";
import tasbiPhoto from "@/assets/tasbi.jpeg";

// ─── Hook: intersection observer for scroll animations ────────────────────────
function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({
    target,
    suffix = "",
    duration = 2000,
}: {
    target: number;
    suffix?: string;
    duration?: number;
}) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView();

    useEffect(() => {
        if (!inView) return;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [inView, target, duration]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

// ─── Floating particle background ────────────────────────────────────────────
function FloatingParticles() {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 15,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-primary-500/10"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Section wrapper with scroll animation ───────────────────────────────────
function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const { ref, inView } = useInView();

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const features = [
        {
            icon: FolderOpen,
            title: "Organized Directory",
            desc: "Browse question papers by Department → Degree → Term → Course → Batch. Find exactly what you need in seconds.",
            color: "text-primary-400",
            bg: "bg-primary-600/10",
            border: "border-primary-600/20",
        },
        {
            icon: Upload,
            title: "Easy Upload",
            desc: "Upload PDF or image question papers directly to your course. Support for Term Final, Class Test, Assignment and more.",
            color: "text-teal-400",
            bg: "bg-teal-600/10",
            border: "border-teal-600/20",
        },
        {
            icon: Search,
            title: "Smart Browse",
            desc: "Navigate through all 29 KU departments. Each department has its full course catalog pre-loaded.",
            color: "text-blue-400",
            bg: "bg-blue-600/10",
            border: "border-blue-600/20",
        },
        {
            icon: Bookmark,
            title: "Bookmarks",
            desc: "Save important question papers and access them anytime from your personal bookmark collection.",
            color: "text-amber-400",
            bg: "bg-amber-600/10",
            border: "border-amber-600/20",
        },
        {
            icon: FileText,
            title: "Inline Viewer",
            desc: "View PDF and image files directly in the browser. No need to download — study right from the platform.",
            color: "text-green-400",
            bg: "bg-green-600/10",
            border: "border-green-600/20",
        },
        {
            icon: Shield,
            title: "Secure & Verified",
            desc: "Real email verification required. Student ID must be unique. Role-based access for admins and discipline admins.",
            color: "text-red-400",
            bg: "bg-red-600/10",
            border: "border-red-600/20",
        },
    ];

    const howItWorks = [
        {
            step: "01",
            title: "Create your account",
            desc: "Register with your real email, unique 6-digit student ID and select your department.",
            note: "⚠ A verification email will be sent. You must verify before logging in.",
            color: "text-primary-400",
            bg: "bg-primary-600",
        },
        {
            step: "02",
            title: "Verify your email",
            desc: "Check your inbox and click the verification link we send you. This is required to activate your account.",
            note: "📧 Check spam folder if not found within 2 minutes.",
            color: "text-teal-400",
            bg: "bg-teal-600",
        },
        {
            step: "03",
            title: "Browse & upload",
            desc: "Navigate to your department's courses and browse uploaded question papers. Upload your own to help others.",
            note: "📁 You can only upload to your own department's courses.",
            color: "text-amber-400",
            bg: "bg-amber-600",
        },
    ];

    const rules = [
        "Student ID must be exactly 6 digits",
        "Use your real university email address",
        "Email verification is mandatory before login",
        "You can only upload to your own department",
        "You can delete only your own uploaded files",
        "Do not upload copyrighted or personal content",
        "Respect other students' contributions",
        "One account per student — no duplicates",
    ];

    const departments = [
        "CSE", "ECE", "SWE", "Architecture", "URP",
        "Mathematics", "Physics", "Chemistry", "Statistics",
        "Pharmacy", "AT", "BGE", "FWT", "ES",
        "FMRT", "Education", "LAW", "Economics",
        "Sociology", "DS", "MCJ", "English", "Bangla",
        "HC", "BAD", "HRM", "PM", "Sculpture", "DP",
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* ── Floating particle CSS ── */}
            <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes hero-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.05); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #6366f1, #a78bfa, #34d399);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-x 4s ease infinite;
        }
        .hero-glow {
          animation: hero-glow 4s ease-in-out infinite;
        }
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
      `}</style>

            {/* ── Navbar ── */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled
                        ? "rgba(3,7,18,0.95)"
                        : "transparent",
                    backdropFilter: scrolled ? "blur(12px)" : "none",
                    borderBottom: scrolled ? "1px solid rgba(99,102,241,0.15)" : "none",
                }}
            >
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-100">KU Question Bank</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="text-sm text-gray-400 hover:text-gray-100 transition-colors px-3 py-1.5"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="btn-primary text-sm"
                        >
                            Get started
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background glow */}
                <div
                    className="hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                    }}
                />
                <FloatingParticles />

                <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-20">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border"
                        style={{
                            background: "rgba(99,102,241,0.1)",
                            borderColor: "rgba(99,102,241,0.3)",
                            color: "#a5b4fc",
                            animation: "fade-in 0.6s ease both",
                        }}
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        Khulna University · Khulna-9208, Bangladesh
                    </div>

                    {/* Headline */}
                    <h1
                        className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                        style={{ animation: "fade-in 0.7s ease 0.1s both" }}
                    >
                        <span className="text-gray-100">KU</span>{" "}
                        <span className="gradient-text">Question Bank</span>
                    </h1>

                    <p
                        className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed"
                        style={{ animation: "fade-in 0.7s ease 0.2s both" }}
                    >
                        The official question paper repository for Khulna University students.
                        Browse, upload, and access past exam papers across all{" "}
                        <span className="text-primary-400 font-medium">29 departments</span>.
                    </p>

                    {/* CTA buttons */}
                    <div
                        className="flex flex-wrap items-center justify-center gap-4 mb-12"
                        style={{ animation: "fade-in 0.7s ease 0.3s both" }}
                    >
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-all duration-200 hover:scale-105 shadow-lg shadow-primary-900/40"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Create Student Account
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-500 hover:text-gray-100 transition-all duration-200"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Important notice */}
                    <div
                        className="inline-flex items-start gap-3 text-left max-w-md mx-auto px-4 py-3 rounded-xl border"
                        style={{
                            background: "rgba(245,158,11,0.08)",
                            borderColor: "rgba(245,158,11,0.25)",
                            animation: "fade-in 0.7s ease 0.4s both",
                        }}
                    >
                        <span className="text-amber-400 text-base mt-0.5">⚠</span>
                        <p className="text-sm text-amber-300/80 leading-relaxed">
                            <span className="font-semibold text-amber-300">
                                Email verification required.
                            </span>{" "}
                            After registration, check your inbox and verify your email before
                            you can sign in.
                        </p>
                    </div>

                    {/* Scroll indicator */}
                    <div
                        className="mt-16 flex flex-col items-center gap-2 text-gray-600"
                        style={{ animation: "fade-in 1s ease 0.8s both" }}
                    >
                        <span className="text-xs">Scroll to explore</span>
                        <div
                            className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1"
                        >
                            <div
                                className="w-1 h-2 rounded-full bg-primary-400"
                                style={{
                                    animation: "float 1.5s ease-in-out infinite alternate",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Section ── */}
            <section className="py-16 border-y border-gray-800/50">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        {[
                            { value: 29, suffix: "", label: "Departments" },
                            { value: 80, suffix: "+", label: "Courses (CSE)" },
                            { value: 8, suffix: "", label: "Academic Terms" },
                            { value: 100, suffix: "%", label: "Free to Use" },
                        ].map(({ value, suffix, label }) => (
                            <AnimatedSection key={label} className="text-center">
                                <p className="text-4xl font-bold text-primary-400">
                                    <AnimatedCounter target={value} suffix={suffix} />
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{label}</p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features Section ── */}
            <section className="py-20 max-w-6xl mx-auto px-4">
                <AnimatedSection className="text-center mb-12">
                    <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-3">
                        Features
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
                        Everything you need to study smarter
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Built specifically for KU students. All the tools you need to find,
                        share, and organize past question papers.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
                        <AnimatedSection key={title} delay={i * 80}>
                            <div
                                className={`card-hover rounded-xl p-6 border bg-gray-900 h-full ${border}`}
                            >
                                <div
                                    className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}
                                >
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <h3 className="text-base font-semibold text-gray-100 mb-2">
                                    {title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="py-20 bg-gray-900/40 border-y border-gray-800/50">
                <div className="max-w-5xl mx-auto px-4">
                    <AnimatedSection className="text-center mb-12">
                        <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
                            How it works
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
                            Get started in 3 simple steps
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Creating your account takes less than 2 minutes. Follow these steps carefully.
                        </p>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {howItWorks.map(({ step, title, desc, note, color, bg }, i) => (
                            <AnimatedSection key={step} delay={i * 100}>
                                <div className="relative card-hover rounded-xl p-6 border border-gray-800 bg-gray-900 h-full">
                                    {/* Step number */}
                                    <div
                                        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}
                                    >
                                        <span className="text-white text-sm font-bold">{step}</span>
                                    </div>

                                    {/* Connector line (desktop) */}
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-11 -right-3 w-6 h-0.5 bg-gray-700 z-10" />
                                    )}

                                    <h3 className="text-base font-semibold text-gray-100 mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                                        {desc}
                                    </p>
                                    <p
                                        className={`text-xs leading-relaxed font-medium ${color} bg-gray-800 rounded-lg px-3 py-2`}
                                    >
                                        {note}
                                    </p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Rules & Guidelines ── */}
            <section className="py-20 max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <AnimatedSection>
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
                            Important guidelines
                        </p>
                        <h2 className="text-3xl font-bold text-gray-100 mb-4">
                            Please read before registering
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            To maintain the integrity of the platform and ensure a fair
                            experience for all students, please follow these guidelines.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 btn-primary"
                        >
                            I understand — Create Account
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </AnimatedSection>

                    <AnimatedSection delay={150}>
                        <div className="space-y-3">
                            {rules.map((rule, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800"
                                    style={{
                                        transitionDelay: `${i * 50}ms`,
                                    }}
                                >
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-300">{rule}</span>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ── Departments Section ── */}
            <section className="py-20 bg-gray-900/40 border-y border-gray-800/50">
                <div className="max-w-5xl mx-auto px-4">
                    <AnimatedSection className="text-center mb-10">
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
                            Coverage
                        </p>
                        <h2 className="text-3xl font-bold text-gray-100 mb-4">
                            All 29 departments covered
                        </h2>
                        <p className="text-gray-400">
                            Question papers from every discipline at Khulna University
                        </p>
                    </AnimatedSection>

                    <AnimatedSection delay={100}>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {departments.map((dept, i) => (
                                <span
                                    key={dept}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-700 text-gray-300 bg-gray-800/50 hover:border-primary-600/50 hover:text-primary-400 hover:bg-primary-600/10 transition-all duration-200 cursor-default"
                                    style={{
                                        animationDelay: `${i * 30}ms`,
                                    }}
                                >
                                    {dept}
                                </span>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="py-24 max-w-4xl mx-auto px-4 text-center">
                <AnimatedSection>
                    <div
                        className="rounded-2xl p-10 border relative overflow-hidden"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)",
                            borderColor: "rgba(99,102,241,0.2)",
                        }}
                    >
                        {/* Background glow */}
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl"
                            style={{ background: "rgba(99,102,241,0.15)" }}
                        />

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-5 mx-auto">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-100 mb-4">
                                Ready to get started?
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                                Join thousands of KU students who use this platform to prepare
                                for exams. Create your free account today.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all duration-200 hover:scale-105 shadow-lg shadow-primary-900/40"
                                >
                                    <GraduationCap className="w-5 h-5" />
                                    Create Free Account
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:border-gray-500 hover:text-gray-100 transition-colors"
                                >
                                    Already have an account? Sign in
                                </Link>
                            </div>

                            <p className="text-xs text-gray-600 mt-5">
                                Free to use · Email verification required · KU students only
                            </p>
                        </div>
                    </div>
                </AnimatedSection>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-gray-800 bg-gray-900/50">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Column 1: Brand */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-gray-100">
                                    KU Question Bank
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                The official question paper repository for Khulna University
                                students. Browse and share past exam papers across all
                                departments.
                            </p>
                            <p className="text-xs text-gray-600">
                                © {new Date().getFullYear()} KU Question Bank. All rights
                                reserved.
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">
                                Quick Links
                            </h3>
                            <ul className="space-y-2.5">
                                {[
                                    { to: "/register", label: "Create Account" },
                                    { to: "/login", label: "Sign In" },
                                    { to: "/login", label: "Browse Questions" },
                                ].map(({ to, label }) => (
                                    <li key={label}>
                                        <Link
                                            to={to}
                                            className="text-sm text-gray-500 hover:text-primary-400 transition-colors flex items-center gap-1.5"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-sm font-semibold text-gray-300 mt-6 mb-4">
                                University
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Khulna University
                                <br />
                                Khulna-9208, Bangladesh
                            </p>
                        </div>

                        {/* Column 3: Developer */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400" />
                                Developer
                            </h3>

                            <div className="flex items-start gap-4">
                                {/* Photo */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={tasbiPhoto}
                                        alt="Md Tasbi Hassan"
                                        className="w-16 h-16 rounded-full object-cover border-2 border-primary-600/50 shadow-lg"
                                        style={{ objectPosition: "top center" }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-100">
                                        Md Tasbi Hassan
                                    </p>
                                    <div className="space-y-1 mt-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                                            BSc(Engg) in CSE, Khulna University
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                                            MSc in CSE (Scholar), Khulna University
                                        </p>
                                        <a
                                            href="mailto:tasbi2116@cseku.ac.bd"
                                            className="text-xs text-gray-500 hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                                        >
                                            <Mail className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-primary-400" />
                                            tasbi2116@cseku.ac.bd
                                        </a>
                                    </div>

                                    {/* Social links */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <a
                                            href="https://www.facebook.com/annuribna.tasbi"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-blue-400 hover:border-blue-700/50 transition-colors"
                                        >
                                            <Facebook className="w-3.5 h-3.5" />
                                            Facebook
                                        </a>
                                        <a
                                            href="https://github.com/Tasbi2116"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-gray-100 hover:border-gray-500 transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                            GitHub
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-gray-600">
                            Built with React, TypeScript, Supabase & Express
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Users className="w-3.5 h-3.5" />
                            For KU students, by a KU student
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}