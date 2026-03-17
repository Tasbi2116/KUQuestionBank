/**
 * Shared TypeScript types for the KU Question Bank client.
 */

export type UserRole = "student" | "discipline_admin" | "admin";

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    student_id: string;
    role: UserRole;
    department_id: string;
    avatar_url?: string;
    created_at: string;
}

export interface Department {
    id: string;
    name: string;
    short_name: string;
    created_at: string;
}

export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}