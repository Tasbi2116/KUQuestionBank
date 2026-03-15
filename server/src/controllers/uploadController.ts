import { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../utils/response";

const uploadMetaSchema = z.object({
    course_id: z.string().uuid("Invalid course ID"),
    batch: z.string().min(1, "Batch is required"),
    exam_type: z.enum([
        "Term Final",
        "Class Test",
        "Assignment",
        "Lab Report",
        "Other",
    ]),
    description: z.string().optional(),
});

/**
 * GET /api/uploads
 * Query params: course_id, batch, exam_type
 * Returns question files — authenticated users only.
 */
export const getUploads = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { course_id, batch, exam_type } = req.query;

    let query = supabaseAdmin
        .from("question_files")
        .select(
            `
      *,
      courses(course_code, course_title, term, degree),
      profiles(full_name, student_id)
    `
        )
        .order("created_at", { ascending: false });

    if (course_id) query = query.eq("course_id", course_id as string);
    if (batch) query = query.eq("batch", batch as string);
    if (exam_type) query = query.eq("exam_type", exam_type as string);

    const { data, error } = await query;

    if (error) {
        sendError(res, "Failed to fetch uploads", 500);
        return;
    }

    sendSuccess(res, data);
};

/**
 * GET /api/uploads/:id
 * Returns a single question file with a signed download URL.
 */
export const getUploadById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const { data: file, error } = await supabaseAdmin
        .from("question_files")
        .select(
            `
      *,
      courses(course_code, course_title, term, degree),
      profiles(full_name, student_id)
    `
        )
        .eq("id", id)
        .single();

    if (error || !file) {
        sendError(res, "File not found", 404);
        return;
    }

    // Generate a signed URL valid for 60 minutes
    const { data: signedUrl, error: urlError } = await supabaseAdmin.storage
        .from("question-files")
        .createSignedUrl(file.file_path, 3600);

    if (urlError) {
        sendError(res, "Failed to generate download URL", 500);
        return;
    }

    sendSuccess(res, { ...file, signed_url: signedUrl.signedUrl });
};

/**
 * POST /api/uploads
 * Uploads a file to Supabase Storage and saves metadata to DB.
 * Expects multipart/form-data with field name "file".
 */
export const uploadFile = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.file) {
        sendError(res, "No file provided", 400);
        return;
    }

    const parsed = uploadMetaSchema.safeParse(req.body);
    if (!parsed.success) {
        sendError(res, parsed.error.errors[0].message, 400);
        return;
    }

    const { course_id, batch, exam_type, description } = parsed.data;
    const userId = req.user!.id;

    // Determine file type
    const isImage = req.file.mimetype.startsWith("image/");
    const fileType = isImage ? "image" : "pdf";

    // Build storage path: userId/courseId/batch/examType/filename
    const sanitizedExamType = exam_type.replace(/\s+/g, "_");
    const timestamp = Date.now();
    const ext = req.file.originalname.split(".").pop() ?? "pdf";
    const fileName = `${sanitizedExamType}_${batch}_${timestamp}.${ext}`;
    const filePath = `${userId}/${course_id}/${batch}/${sanitizedExamType}/${fileName}`;

    // Upload to Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
        .from("question-files")
        .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
        });

    if (storageError) {
        sendError(res, `Storage upload failed: ${storageError.message}`, 500);
        return;
    }

    // Save metadata to DB
    const { data, error: dbError } = await supabaseAdmin
        .from("question_files")
        .insert({
            course_id,
            uploaded_by: userId,
            batch,
            exam_type,
            file_name: req.file.originalname,
            file_path: filePath,
            file_type: fileType,
            file_size: req.file.size,
            description,
        })
        .select()
        .single();

    if (dbError) {
        // Rollback storage upload on DB failure
        await supabaseAdmin.storage.from("question-files").remove([filePath]);
        sendError(res, "Failed to save file metadata", 500);
        return;
    }

    sendSuccess(res, data, "File uploaded successfully", 201);
};

/**
 * DELETE /api/uploads/:id
 * Deletes file from storage and DB.
 * Only the uploader or an admin can delete.
 */
export const deleteUpload = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Fetch file to verify ownership
    const { data: file, error: fetchError } = await supabaseAdmin
        .from("question_files")
        .select("id, file_path, uploaded_by")
        .eq("id", id)
        .single();

    if (fetchError || !file) {
        sendError(res, "File not found", 404);
        return;
    }

    if (file.uploaded_by !== userId && userRole !== "admin") {
        sendError(res, "You can only delete your own uploads", 403);
        return;
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
        .from("question-files")
        .remove([file.file_path]);

    if (storageError) {
        sendError(res, "Failed to delete file from storage", 500);
        return;
    }

    // Delete from DB
    const { error: dbError } = await supabaseAdmin
        .from("question_files")
        .delete()
        .eq("id", id);

    if (dbError) {
        sendError(res, "Failed to delete file record", 500);
        return;
    }

    sendSuccess(res, null, "File deleted successfully");
};