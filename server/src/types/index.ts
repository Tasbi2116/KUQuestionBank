/**
 * Shared TypeScript types for the KU Question Bank server.
 */

export type UserRole = "student" | "discipline_admin" | "admin";

export type ExamType =
    | "Term Final"
    | "Class Test"
    | "Assignment"
    | "Lab Report"
    | "Other";

export type CourseType =
    | "theory"
    | "lab"
    | "project"
    | "thesis"
    | "elective";

export type Degree = "BSc" | "MSc";

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    student_id: string;
    department_id: string;
}

export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── Augment Express Request ──────────────────────────────────────────────────
// This is what makes req.user work across all controllers
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}