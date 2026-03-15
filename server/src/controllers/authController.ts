import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

// ─── Validation schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    student_id: z.string().min(2, "Student ID is required"),
    department_id: z.string().uuid("Invalid department ID"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new Supabase auth user + profile via trigger.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { email, password, full_name, student_id, department_id } =
        parsed.data;

    // Check student_id uniqueness before creating auth user
    const { data: existingStudent } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("student_id", student_id)
        .single();

    if (existingStudent) {
        sendError(res, "Student ID already registered", 409);
        return;
    }

    // Create auth user — Supabase trigger will create the profile
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // requires email verification
        user_metadata: {
            full_name,
            student_id,
            department_id,
        },
    });

    if (error) {
        if (error.message.includes("already registered")) {
            sendError(res, "Email already registered", 409);
            return;
        }
        sendError(res, error.message, 400);
        return;
    }

    sendSuccess(
        res,
        { user_id: data.user.id },
        "Registration successful. Please check your email to verify your account.",
        201
    );
};

/**
 * POST /api/auth/login
 * Signs in via Supabase — returns session tokens.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { email, password } = parsed.data;

    const { data, error } =
        await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

    if (error) {
        sendError(res, "Invalid email or password", 401);
        return;
    }

    // Fetch profile
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, student_id, role, department_id, avatar_url, created_at")
        .eq("id", data.user.id)
        .single();

    sendSuccess(res, {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: profile,
    });
};

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select(
            "id, email, full_name, student_id, role, department_id, avatar_url, created_at"
        )
        .eq("id", req.user!.id)
        .single();

    if (error || !profile) {
        sendError(res, "Profile not found", 404);
        return;
    }

    sendSuccess(res, profile);
};

/**
 * PATCH /api/auth/me
 * Updates the authenticated user's profile.
 */
export const updateMe = async (req: Request, res: Response): Promise<void> => {
    const updateSchema = z.object({
        full_name: z.string().min(2).optional(),
        avatar_url: z.string().url().optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .update(parsed.data)
        .eq("id", req.user!.id)
        .select()
        .single();

    if (error) {
        sendError(res, "Failed to update profile", 500);
        return;
    }

    sendSuccess(res, data, "Profile updated successfully");
};