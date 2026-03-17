import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin, supabaseAnon } from "../config/supabase";
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
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 400);
            return;
        }

        const { email, password, full_name, student_id, department_id } =
            parsed.data;

        // Check student_id uniqueness
        const { data: existingStudent } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("student_id", student_id)
            .maybeSingle();

        if (existingStudent) {
            sendError(res, "Student ID already registered", 409);
            return;
        }

        // Check email uniqueness
        const { data: existingEmail } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existingEmail) {
            sendError(res, "Email already registered", 409);
            return;
        }

        // Sign up via anon client — triggers email verification
        const { data, error } = await supabaseAnon.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`,
                data: {
                    full_name,
                    student_id,
                    department_id,
                },
            },
        });

        if (error) {
            console.error("[register] signUp error:", error.message);
            if (
                error.message.toLowerCase().includes("already registered") ||
                error.message.toLowerCase().includes("already exists")
            ) {
                sendError(res, "Email already registered", 409);
                return;
            }
            sendError(res, error.message, 400);
            return;
        }

        if (!data.user) {
            sendError(res, "Registration failed. Please try again.", 500);
            return;
        }

        console.log("[register] user created:", data.user.id);

        sendSuccess(
            res,
            { user_id: data.user.id },
            "Registration successful. Please check your email to verify your account.",
            201
        );
    } catch (err) {
        console.error("[register] unexpected error:", err);
        sendError(res, "Registration failed. Please try again.", 500);
    }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 400);
            return;
        }

        const { email, password } = parsed.data;

        const { data, error } = await supabaseAnon.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("[login] error:", error.message);
            if (
                error.message.toLowerCase().includes("email not confirmed") ||
                error.message.toLowerCase().includes("not confirmed")
            ) {
                sendError(
                    res,
                    "Please verify your email before signing in. Check your inbox.",
                    401
                );
                return;
            }
            sendError(res, "Invalid email or password", 401);
            return;
        }

        if (!data.session) {
            sendError(res, "Login failed. Please try again.", 500);
            return;
        }

        // Fetch profile
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select(
                "id, email, full_name, student_id, role, department_id, avatar_url, created_at"
            )
            .eq("id", data.user.id)
            .maybeSingle();

        sendSuccess(res, {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            user: profile,
        });
    } catch (err) {
        console.error("[login] unexpected error:", err);
        sendError(res, "Login failed. Please try again.", 500);
    }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select(
                "id, email, full_name, student_id, role, department_id, avatar_url, created_at"
            )
            .eq("id", req.user!.id)
            .maybeSingle();

        if (error || !profile) {
            sendError(res, "Profile not found", 404);
            return;
        }

        sendSuccess(res, profile);
    } catch (err) {
        console.error("[getMe] unexpected error:", err);
        sendError(res, "Failed to fetch profile", 500);
    }
};

/**
 * PATCH /api/auth/me
 */
export const updateMe = async (req: Request, res: Response): Promise<void> => {
    try {
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
            .maybeSingle();

        if (error || !data) {
            sendError(res, "Failed to update profile", 500);
            return;
        }

        sendSuccess(res, data, "Profile updated successfully");
    } catch (err) {
        console.error("[updateMe] unexpected error:", err);
        sendError(res, "Failed to update profile", 500);
    }
};