import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

/**
 * GET /api/bookmarks
 * Returns all bookmarks for the authenticated user.
 */
export const getBookmarks = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { data, error } = await supabaseAdmin
        .from("bookmarks")
        .select(
            `
      *,
      question_files(
        id, file_name, file_type, exam_type, batch, created_at,
        courses(course_code, course_title, term)
      )
    `
        )
        .eq("user_id", req.user!.id)
        .order("created_at", { ascending: false });

    if (error) {
        sendError(res, "Failed to fetch bookmarks", 500);
        return;
    }

    sendSuccess(res, data);
};

/**
 * POST /api/bookmarks
 * Adds a bookmark.
 */
export const addBookmark = async (
    req: Request,
    res: Response
): Promise<void> => {
    const schema = z.object({
        question_file_id: z.string().uuid("Invalid file ID"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("bookmarks")
        .insert({
            user_id: req.user!.id,
            question_file_id: parsed.data.question_file_id,
        })
        .select()
        .single();

    if (error) {
        if (error.message.includes("unique")) {
            sendError(res, "Already bookmarked", 409);
            return;
        }
        sendError(res, "Failed to add bookmark", 500);
        return;
    }

    sendSuccess(res, data, "Bookmark added", 201);
};

/**
 * DELETE /api/bookmarks/:id
 */
export const removeBookmark = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const { error } = await supabaseAdmin
        .from("bookmarks")
        .delete()
        .eq("id", id)
        .eq("user_id", req.user!.id);

    if (error) {
        sendError(res, "Failed to remove bookmark", 500);
        return;
    }

    sendSuccess(res, null, "Bookmark removed");
};