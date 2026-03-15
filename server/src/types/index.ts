/**
 * Shared TypeScript types for the KU Question Bank server.
 */

export type UserRole = "student" | "admin";

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