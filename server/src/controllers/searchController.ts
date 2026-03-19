import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

const searchSchema = z.object({
    q: z.string().min(1, "Search query is required").max(100),
    dept: z.string().uuid().optional(),
    degree: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
});

/**
 * GET /api/search?q=machine+learning&dept=uuid&degree=BSc
 * Full-text search across question files, courses and departments.
 */
export const searchFiles = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const parsed = searchSchema.safeParse(req.query);
        if (!parsed.success) {
            sendError(res, parsed.error.errors[0].message, 400);
            return;
        }

        const { q, dept, degree, limit } = parsed.data;

        const { data, error } = await supabaseAdmin.rpc(
            "search_question_files",
            {
                search_query: q,
                dept_id: dept ?? null,
                degree_filter: degree ?? null,
                limit_count: limit,
            }
        );

        if (error) {
            console.error("[search] RPC error:", error.message);
            sendError(res, "Search failed. Please try again.", 500);
            return;
        }

        sendSuccess(res, {
            query: q,
            results: data ?? [],
            count: (data ?? []).length,
        });
    } catch (err) {
        console.error("[search] unexpected error:", err);
        sendError(res, "Search failed. Please try again.", 500);
    }
};