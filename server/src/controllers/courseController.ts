import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

const courseSchema = z.object({
    department_id: z.string().uuid(),
    degree: z.enum(["BSc", "MSc"]),
    term: z.string().min(1, "Term is required"),
    course_code: z.string().min(1, "Course code is required"),
    course_title: z.string().min(1, "Course title is required"),
    credit_hours: z.number().positive(),
    course_type: z.enum(["theory", "lab", "project", "thesis", "elective"]),
    is_optional: z.boolean().default(false),
});

/**
 * GET /api/courses
 * Query params: department_id, degree, term
 */
export const getCourses = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { department_id, degree, term } = req.query;

    let query = supabaseAdmin
        .from("courses")
        .select("*, departments(name, short_name)")
        .order("term")
        .order("course_code");

    if (department_id) {
        query = query.eq("department_id", department_id as string);
    }
    if (degree) {
        query = query.eq("degree", degree as string);
    }
    if (term) {
        query = query.eq("term", term as string);
    }

    const { data, error } = await query;

    if (error) {
        sendError(res, "Failed to fetch courses", 500);
        return;
    }

    sendSuccess(res, data);
};

/**
 * GET /api/courses/:id
 */
export const getCourseById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
        .from("courses")
        .select("*, departments(name, short_name)")
        .eq("id", id)
        .single();

    if (error || !data) {
        sendError(res, "Course not found", 404);
        return;
    }

    sendSuccess(res, data);
};

/**
 * POST /api/courses — admin only
 */
export const createCourse = async (
    req: Request,
    res: Response
): Promise<void> => {
    const parsed = courseSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("courses")
        .insert(parsed.data)
        .select()
        .single();

    if (error) {
        if (error.message.includes("unique")) {
            sendError(res, "Course code already exists for this department", 409);
            return;
        }
        sendError(res, "Failed to create course", 500);
        return;
    }

    sendSuccess(res, data, "Course created", 201);
};

/**
 * PATCH /api/courses/:id — admin only
 */
export const updateCourse = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const parsed = courseSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("courses")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        sendError(res, "Failed to update course", 500);
        return;
    }

    sendSuccess(res, data, "Course updated");
};

/**
 * DELETE /api/courses/:id — admin only
 */
export const deleteCourse = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const { error } = await supabaseAdmin
        .from("courses")
        .delete()
        .eq("id", id);

    if (error) {
        sendError(res, "Failed to delete course", 500);
        return;
    }

    sendSuccess(res, null, "Course deleted");
};