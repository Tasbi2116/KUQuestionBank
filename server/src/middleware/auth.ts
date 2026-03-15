import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import { sendError } from "../utils/response";
import { AuthUser } from "../types";

/**
 * Middleware: verifies the Supabase JWT from the Authorization header.
 * Attaches the authenticated user to req.user.
 */
export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        sendError(res, "Missing or invalid authorization header", 401);
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token with Supabase
        const {
            data: { user },
            error,
        } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            sendError(res, "Invalid or expired token", 401);
            return;
        }

        // Fetch profile to get role and student info
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, email, role, student_id, department_id")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            sendError(res, "User profile not found", 401);
            return;
        }

        req.user = profile as AuthUser;
        next();
    } catch (err) {
        sendError(res, "Authentication failed", 401);
    }
};

/**
 * Middleware: restricts route to admin role only.
 * Must be used AFTER requireAuth.
 */
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user || req.user.role !== "admin") {
        sendError(res, "Admin access required", 403);
        return;
    }
    next();
};