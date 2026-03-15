import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

const departmentSchema = z.object({
    name: z.string().min(2, "Department name is required"),
    short_name: z.string().min(1, "Short name is required").toUpperCase(),
});

/**
 * GET /api/departments
 * Returns all departments — public.
 */
export const getAllDepartments = async (
    _req: Request,
    res: Response
): Promise<void> => {
    const { data, error } = await supabaseAdmin
        .from("departments")
        .select("*")
        .order("short_name");

    if (error) {
        sendError(res, "Failed to fetch departments", 500);
        return;
    }

    sendSuccess(res, data);
};

/**
 * GET /api/departments/:id
 * Returns a single department with its courses.
 */
export const getDepartmentById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
        .from("departments")
        .select("*, courses(*)")
        .eq("id", id)
        .single();

    if (error || !data) {
        sendError(res, "Department not found", 404);
        return;
    }

    sendSuccess(res, data);
};

/**
 * POST /api/departments — admin only
 */
export const createDepartment = async (
    req: Request,
    res: Response
): Promise<void> => {
    const parsed = departmentSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("departments")
        .insert(parsed.data)
        .select()
        .single();

    if (error) {
        if (error.message.includes("unique")) {
            sendError(res, "Department short name already exists", 409);
            return;
        }
        sendError(res, "Failed to create department", 500);
        return;
    }

    sendSuccess(res, data, "Department created", 201);
};

/**
 * PATCH /api/departments/:id — admin only
 */
export const updateDepartment = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const parsed = departmentSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("departments")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        sendError(res, "Failed to update department", 500);
        return;
    }

    sendSuccess(res, data, "Department updated");
};

/**
 * DELETE /api/departments/:id — admin only
 */
export const deleteDepartment = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const { error } = await supabaseAdmin
        .from("departments")
        .delete()
        .eq("id", id);

    if (error) {
        sendError(res, "Failed to delete department", 500);
        return;
    }

    sendSuccess(res, null, "Department deleted");
};