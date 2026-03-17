import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

/**
 * GET /api/admin/stats
 */
export const getStats = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { role, department_id } = req.user!;

        const usersQuery = supabaseAdmin
            .from("profiles")
            .select("id", { count: "exact", head: true });

        const coursesQuery = supabaseAdmin
            .from("courses")
            .select("id", { count: "exact", head: true });

        if (role === "discipline_admin") {
            usersQuery.eq("department_id", department_id);
            coursesQuery.eq("department_id", department_id);
        }

        const [usersRes, filesRes, coursesRes, deptsRes] = await Promise.all([
            usersQuery,
            supabaseAdmin
                .from("question_files")
                .select("id", { count: "exact", head: true }),
            coursesQuery,
            supabaseAdmin
                .from("departments")
                .select("id", { count: "exact", head: true }),
        ]);

        sendSuccess(res, {
            totalUsers: usersRes.count ?? 0,
            totalFiles: filesRes.count ?? 0,
            totalCourses: coursesRes.count ?? 0,
            totalDepartments: deptsRes.count ?? 0,
        });
    } catch (err) {
        console.error("[getStats]", err);
        sendError(res, "Failed to fetch stats", 500);
    }
};

/**
 * GET /api/admin/users
 * Full admin: all users
 * Discipline admin: only users in their department
 */
export const getAllUsers = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { role, department_id } = req.user!;

        let query = supabaseAdmin
            .from("profiles")
            .select(
                "id, full_name, email, student_id, role, department_id, created_at, departments(short_name, name)"
            )
            .order("created_at", { ascending: false });

        if (role === "discipline_admin") {
            query = query.eq("department_id", department_id);
        }

        const { data, error } = await query;

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
 */
export const updateUserRole = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const actorRole = req.user!.role;
        const actorDeptId = req.user!.department_id;

        const schema = z.object({
            role: z.enum(["student", "discipline_admin", "admin"]),
        });

        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, "Invalid role value", 400);
            return;
        }

        const newRole = parsed.data.role;

        if (id === req.user!.id && newRole === "student") {
            sendError(res, "You cannot demote yourself", 400);
            return;
        }

        if (actorRole === "discipline_admin" && newRole !== "student") {
            sendError(
                res,
                "Discipline admin can only set users to student role",
                403
            );
            return;
        }

        if (actorRole === "discipline_admin") {
            const { data: targetUser } = await supabaseAdmin
                .from("profiles")
                .select("department_id")
                .eq("id", id)
                .maybeSingle();

            if (!targetUser || targetUser.department_id !== actorDeptId) {
                sendError(res, "You can only manage users in your department", 403);
                return;
            }
        }

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update({ role: newRole })
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
 */
export const deleteUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const actorRole = req.user!.role;
        const actorDeptId = req.user!.department_id;

        if (id === req.user!.id) {
            sendError(res, "You cannot delete your own account", 400);
            return;
        }

        if (actorRole === "discipline_admin") {
            const { data: targetUser } = await supabaseAdmin
                .from("profiles")
                .select("department_id, role")
                .eq("id", id)
                .maybeSingle();

            if (!targetUser || targetUser.department_id !== actorDeptId) {
                sendError(res, "You can only delete users in your department", 403);
                return;
            }

            if (targetUser.role === "admin") {
                sendError(res, "You cannot delete an admin user", 403);
                return;
            }
        }

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