import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import { sendError } from "../utils/response";
import { AuthUser } from "../types";

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

    if (!token || token === "undefined" || token === "null") {
        sendError(res, "Invalid token", 401);
        return;
    }

    try {
        const {
            data: { user },
            error,
        } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            sendError(res, "Invalid or expired token", 401);
            return;
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, email, role, student_id, department_id")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError || !profile) {
            sendError(res, "User profile not found", 401);
            return;
        }

        req.user = profile as AuthUser;
        next();
    } catch (err) {
        console.error("[requireAuth] error:", err);
        sendError(res, "Authentication failed", 401);
    }
};

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