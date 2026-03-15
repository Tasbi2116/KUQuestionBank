import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

const noteSchema = z.object({
    question_file_id: z.string().uuid("Invalid file ID"),
    content: z.string().min(1, "Note content cannot be empty"),
});

/**
 * GET /api/notes?question_file_id=xxx
 * Returns the authenticated user's note for a specific file.
 */
export const getNote = async (req: Request, res: Response): Promise<void> => {
    const { question_file_id } = req.query;

    if (!question_file_id) {
        sendError(res, "question_file_id is required", 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("notes")
        .select("*")
        .eq("user_id", req.user!.id)
        .eq("question_file_id", question_file_id as string)
        .single();

    if (error && error.code !== "PGRST116") {
        sendError(res, "Failed to fetch note", 500);
        return;
    }

    sendSuccess(res, data ?? null);
};

/**
 * POST /api/notes
 * Creates or updates a note (upsert).
 */
export const upsertNote = async (
    req: Request,
    res: Response
): Promise<void> => {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { data, error } = await supabaseAdmin
        .from("notes")
        .upsert(
            {
                user_id: req.user!.id,
                question_file_id: parsed.data.question_file_id,
                content: parsed.data.content,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,question_file_id" }
        )
        .select()
        .single();

    if (error) {
        sendError(res, "Failed to save note", 500);
        return;
    }

    sendSuccess(res, data, "Note saved");
};

/**
 * DELETE /api/notes/:id
 */
export const deleteNote = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const { error } = await supabaseAdmin
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", req.user!.id);

    if (error) {
        sendError(res, "Failed to delete note", 500);
        return;
    }

    sendSuccess(res, null, "Note deleted");
};