import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  StickyNote,
  ShieldCheck,
  Filter,
  Eye,
  UserCheck,
  BookMarked,
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

// ─── Tutorial tab types ───────────────────────────────────────────────────────
type TutorialRole = "student" | "discipline_admin" | "admin";

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [tutorialTab, setTutorialTab] = useState<TutorialRole>("student");
  const tutorialRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTutorial = () => {
    tutorialRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
      title: "Full-Text Search",
      desc: "Search across all question papers by course name, code, batch year or exam type. Results appear instantly.",
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
      desc: "View PDF and image files directly in the browser with zoom, rotate and page navigation. No download needed.",
      color: "text-green-400",
      bg: "bg-green-600/10",
      border: "border-green-600/20",
    },
    {
      icon: StickyNote,
      title: "Private Notes",
      desc: "Write private notes while viewing any question paper. Auto-saved, only visible to you.",
      color: "text-purple-400",
      bg: "bg-purple-600/10",
      border: "border-purple-600/20",
    },
    {
      icon: Filter,
      title: "Smart Filters",
      desc: "Filter files by batch year and exam type inside each course. Find the exact paper you need instantly.",
      color: "text-pink-400",
      bg: "bg-pink-600/10",
      border: "border-pink-600/20",
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

  // ── Tutorial content per role ─────────────────────────────────────────────
  const tutorialContent: Record<
    TutorialRole,
    { icon: React.ElementType; color: string; bg: string; badge: string; steps: { icon: React.ElementType; title: string; desc: string; tip?: string }[] }
  > = {
    student: {
      icon: GraduationCap,
      color: "text-primary-400",
      bg: "bg-primary-600/10",
      badge: "For Students",
      steps: [
        {
          icon: UserCheck,
          title: "Register and verify your email",
          desc: "Go to Create Account. Fill in your full name, university email, 6-digit student ID, and select your department. A verification email will be sent — click the link inside to activate your account.",
          tip: "Check your spam folder if the email doesn't arrive within 2 minutes.",
        },
        {
          icon: FolderOpen,
          title: "Browse question papers",
          desc: "After logging in, click Browse in the sidebar. Navigate through Department → Degree (BSc / BSc(OBE) / MSc) → Term → Course. You will see all uploaded question papers for that course.",
          tip: "Use the Batch and Exam Type filters to quickly find the year and type you need.",
        },
        {
          icon: Search,
          title: "Search across all papers",
          desc: "Click Search in the sidebar or press Ctrl+K anywhere. Type a course name, course code, batch year, or exam type. Results appear instantly with highlighted matches.",
          tip: "Try searching '21 Term Final' or 'CSE 3101' for targeted results.",
        },
        {
          icon: Eye,
          title: "View files inline",
          desc: "Click View on any question paper. PDFs open inside the browser with zoom, rotate, and page navigation. Images open with zoom and rotate controls. No download required.",
          tip: "Press Escape to close the viewer at any time.",
        },
        {
          icon: StickyNote,
          title: "Write private notes",
          desc: "While viewing any file, click the Notes button in the toolbar. A panel slides in from the right where you can write notes. Notes auto-save after 2 seconds. Press Ctrl+S to save immediately.",
          tip: "Notes are completely private — only you can see them.",
        },
        {
          icon: Upload,
          title: "Upload question papers",
          desc: "Navigate to a course inside your own department. Scroll down to the Upload section. Select the batch year, exam type, and optionally a description. Choose a PDF or image file (max 10MB) and click Upload.",
          tip: "You can only upload to courses in your own department. A real-time progress bar shows the upload status.",
        },
        {
          icon: Bookmark,
          title: "Bookmark papers",
          desc: "While viewing files, bookmark any paper you want to revisit later. Access all your bookmarked papers from the Bookmarks page in the sidebar.",
          tip: "Bookmarks are personal — they are not visible to other students.",
        },
      ],
    },
    discipline_admin: {
      icon: Shield,
      color: "text-amber-400",
      bg: "bg-amber-600/10",
      badge: "For Discipline Admins",
      steps: [
        {
          icon: UserCheck,
          title: "Accessing the Discipline Admin panel",
          desc: "After your role is assigned by the system admin, log in and click Discipline Admin in the sidebar. You will see a dashboard with stats for your department — users, courses, and files.",
          tip: "You can also access the student view anytime by clicking Student View at the bottom of the admin sidebar.",
        },
        {
          icon: Users,
          title: "Managing users in your department",
          desc: "Go to Users in the admin panel. You will see all students registered under your department. You can delete users who have incorrect registrations. You cannot change roles — only the full admin can assign roles.",
          tip: "Use the search box to find a specific student by name, email or student ID.",
        },
        {
          icon: BookOpen,
          title: "Managing courses",
          desc: "Go to Courses in the admin panel. You can add new courses for your department by clicking Add Course. Fill in the course code, title, term, degree and credit hours. You can also delete courses that are no longer offered.",
          tip: "Courses you add will appear immediately in the Browse directory for your department.",
        },
        {
          icon: FileText,
          title: "Managing uploaded files",
          desc: "Go to Files in the admin panel. You can see all question papers uploaded by students in your department. Use the search box to find specific files. Click the eye icon to view any file inline. Click the trash icon to delete inappropriate files.",
          tip: "You can delete any file in your department — not just your own.",
        },
        {
          icon: FolderOpen,
          title: "What you cannot do",
          desc: "As a Discipline Admin you cannot manage other departments, add or edit departments, or assign admin or discipline_admin roles. These actions are reserved for the full system admin.",
          tip: "If you need to make department-level changes, contact the system administrator.",
        },
      ],
    },
    admin: {
      icon: ShieldCheck,
      color: "text-red-400",
      bg: "bg-red-600/10",
      badge: "For Administrators",
      steps: [
        {
          icon: ShieldCheck,
          title: "Accessing the Admin panel",
          desc: "Log in with your admin account. Click Admin Panel in the sidebar. The dashboard shows system-wide stats — total users, departments, courses, and uploaded files.",
          tip: "You can switch back to the student view anytime using Student View at the bottom of the admin sidebar.",
        },
        {
          icon: Users,
          title: "Managing all users",
          desc: "Go to Users. You can see every registered student across all departments. Use the role toggle button to promote a student to Discipline Admin or full Admin. Use the trash icon to delete accounts.",
          tip: "You cannot demote or delete your own account — this is a safety protection.",
        },
        {
          icon: FolderOpen,
          title: "Managing departments",
          desc: "Go to Departments. Add new departments with a full name and short name. Edit existing department names inline by clicking the pencil icon. Delete departments — note that all associated courses will also be deleted.",
          tip: "Only the full admin can manage departments. Discipline admins cannot see this tab.",
        },
        {
          icon: BookOpen,
          title: "Managing all courses",
          desc: "Go to Courses. Add courses for any department. Filter by department or term to find specific courses. Delete courses that are outdated or incorrect. All course changes reflect immediately in the Browse directory.",
          tip: "Use the department and term filters to quickly find courses across the system.",
        },
        {
          icon: FileText,
          title: "Managing all uploaded files",
          desc: "Go to Files. You can see every file uploaded by any student across all departments. Use the search box to filter by file name, course, uploader or batch. Click the eye icon to view files inline. Click the trash icon to delete any file.",
          tip: "Admin file deletion is permanent and cannot be undone.",
        },
        {
          icon: UserCheck,
          title: "Assigning Discipline Admins",
          desc: "Go to Users, find the student you want to promote, and click the shield icon next to their name. Select Discipline Admin from the role options. That student will immediately see the Discipline Admin panel in their sidebar.",
          tip: "Discipline admins can only manage their own department. Full admins manage everything.",
        },
      ],
    },
  };

  const currentTutorial = tutorialContent[tutorialTab];

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 text-gray-100 dark:text-gray-100">
      {/* ── Styles ── */}
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #6366f1, #a78bfa, #34d399);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-x 4s ease infinite;
        }
        .hero-glow { animation: hero-glow 4s ease-in-out infinite; }
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
          background: scrolled ? "rgba(3,7,18,0.95)" : "transparent",
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
          <div className="flex items-center gap-2">
            {/* Tutorial quick link in navbar */}
            <button
              onClick={scrollToTutorial}
              className="text-sm text-gray-400 hover:text-gray-100 transition-colors px-3 py-1.5 hidden sm:block"
            >
              Tutorial
            </button>
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-gray-100 transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
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
            className="flex flex-wrap items-center justify-center gap-4 mb-8"
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
            {/* Tutorial button in hero */}
            <button
              onClick={scrollToTutorial}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary-700/40 text-primary-400 font-semibold text-sm hover:border-primary-600 hover:bg-primary-600/10 transition-all duration-200"
            >
              <BookMarked className="w-4 h-4" />
              How to use
            </button>
          </div>

          {/* Email verification notice */}
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
            <div className="w-5 h-8 rounded-full border border-gray-700 flex items-start justify-center p-1">
              <div
                className="w-1 h-2 rounded-full bg-primary-400"
                style={{ animation: "float 1.5s ease-in-out infinite alternate" }}
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
              { value: 29,  suffix: "",  label: "Departments" },
              { value: 107, suffix: "+", label: "ECE Courses" },
              { value: 8,   suffix: "",  label: "Academic Terms" },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
            <AnimatedSection key={title} delay={i * 60}>
              <div className={`card-hover rounded-xl p-6 border bg-gray-900 h-full ${border}`}>
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-100 mb-2">{title}</h3>
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
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                    <span className="text-white text-sm font-bold">{step}</span>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-11 -right-3 w-6 h-0.5 bg-gray-700 z-10" />
                  )}
                  <h3 className="text-base font-semibold text-gray-100 mb-2">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{desc}</p>
                  <p className={`text-xs leading-relaxed font-medium ${color} bg-gray-800 rounded-lg px-3 py-2`}>
                    {note}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tutorial Section ── */}
      <section ref={tutorialRef} className="py-20 max-w-5xl mx-auto px-4" id="tutorial">
        <AnimatedSection className="text-center mb-10">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">
            User Guide
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
            Step-by-step tutorial
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Detailed guide for every type of user — students, discipline admins, and system admins.
          </p>
        </AnimatedSection>

        {/* Role tabs */}
        <AnimatedSection delay={100}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {(
              [
                { role: "student",          label: "Student",          icon: GraduationCap, color: "text-primary-400", activeBg: "bg-primary-600/20 border-primary-600/50 text-primary-400" },
                { role: "discipline_admin", label: "Discipline Admin",  icon: Shield,        color: "text-amber-400",   activeBg: "bg-amber-600/20 border-amber-600/50 text-amber-400" },
                { role: "admin",            label: "System Admin",      icon: ShieldCheck,   color: "text-red-400",     activeBg: "bg-red-600/20 border-red-600/50 text-red-400" },
              ] as const
            ).map(({ role, label, icon: Icon, activeBg }) => (
              <button
                key={role}
                onClick={() => setTutorialTab(role)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  tutorialTab === role
                    ? activeBg
                    : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Tutorial steps */}
        <AnimatedSection delay={150}>
          <div className="space-y-4">
            {currentTutorial.steps.map(({ icon: StepIcon, title, desc, tip }, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex gap-4"
                style={{
                  animation: `fade-in 0.3s ease ${i * 60}ms both`,
                }}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-lg ${currentTutorial.bg} flex items-center justify-center`}>
                    <StepIcon className={`w-4 h-4 ${currentTutorial.color}`} />
                  </div>
                  <span className="text-xs font-mono text-gray-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-100 mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {desc}
                  </p>
                  {tip && (
                    <div className="flex items-start gap-2 mt-2.5 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50">
                      <span className="text-xs mt-0.5">💡</span>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA below tutorial */}
        <AnimatedSection delay={200}>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Ready to get started?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                Create Account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:border-gray-500 hover:text-gray-100 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Rules & Guidelines ── */}
      <section className="py-20 bg-gray-900/40 border-y border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4">
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
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
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{rule}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Departments Section ── */}
      <section className="py-20 max-w-5xl mx-auto px-4">
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
            {departments.map((dept) => (
              <span
                key={dept}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-700 text-gray-300 bg-gray-800/50 hover:border-primary-600/50 hover:text-primary-400 hover:bg-primary-600/10 transition-all duration-200 cursor-default"
              >
                {dept}
              </span>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 max-w-4xl mx-auto px-4 text-center">
        <AnimatedSection>
          <div
            className="rounded-2xl p-10 border relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)",
              borderColor: "rgba(99,102,241,0.2)",
            }}
          >
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
                Join KU students who use this platform to prepare for exams.
                Create your free account today.
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
                <span className="font-semibold text-gray-100">KU Question Bank</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                The official question paper repository for Khulna University
                students. Browse and share past exam papers across all departments.
              </p>
              <p className="text-xs text-gray-600">
                © {new Date().getFullYear()} KU Question Bank. All rights reserved.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Create Account", to: "/register" },
                  { label: "Sign In",        to: "/login" },
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
                <li>
                  <button
                    onClick={scrollToTutorial}
                    className="text-sm text-gray-500 hover:text-primary-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    User Tutorial
                  </button>
                </li>
              </ul>

              <h3 className="text-sm font-semibold text-gray-300 mt-6 mb-4">University</h3>
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
                <div className="flex-shrink-0">
                  <img
                    src={tasbiPhoto}
                    alt="Md Tasbi Hassan"
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-600/50 shadow-lg"
                    style={{ objectPosition: "top center" }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-100">Md Tasbi Hassan</p>
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