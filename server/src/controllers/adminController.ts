import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

/**
 * GET /api/admin/users
 * Returns all user profiles — admin only.
 */
export const getAllUsers = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select(
                "id, full_name, email, student_id, role, department_id, created_at, departments(short_name, name)"
            )
            .order("created_at", { ascending: false });

        if (error) {
            sendError(res, "Failed to fetch users", 500);
            return;
        }

        sendSuccess(res, data);
    } catch (err) {
        console.error("[getAllUsers]", err);
        sendError(res, "Failed to fetch users", 500);
    }
};

/**
 * PATCH /api/admin/users/:id/role
 * Updates a user's role — admin only.
 */
export const updateUserRole = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const schema = z.object({
            role: z.enum(["student", "admin"]),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, "Role must be student or admin", 400);
            return;
        }

        // Prevent admin from demoting themselves
        if (id === req.user!.id && parsed.data.role === "student") {
            sendError(res, "You cannot demote yourself", 400);
            return;
        }

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update({ role: parsed.data.role })
            .eq("id", id)
            .select()
            .maybeSingle();

        if (error || !data) {
            sendError(res, "Failed to update user role", 500);
            return;
        }

        sendSuccess(res, data, "User role updated");
    } catch (err) {
        console.error("[updateUserRole]", err);
        sendError(res, "Failed to update user role", 500);
    }
};

/**
 * DELETE /api/admin/users/:id
 * Deletes a user — admin only.
 */
export const deleteUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.user!.id) {
            sendError(res, "You cannot delete your own account", 400);
            return;
        }

        // Delete from Supabase Auth — profile deleted via cascade
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            sendError(res, "Failed to delete user", 500);
            return;
        }

        sendSuccess(res, null, "User deleted successfully");
    } catch (err) {
        console.error("[deleteUser]", err);
        sendError(res, "Failed to delete user", 500);
    }
};