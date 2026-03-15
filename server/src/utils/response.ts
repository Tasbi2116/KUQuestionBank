import { Response } from "express";
import { ApiResponse } from "../types";

/**
 * Send a standardized success response.
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200
): void => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };
    res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode = 400,
    error?: string
): void => {
    const response: ApiResponse = {
        success: false,
        message,
        error,
    };
    res.status(statusCode).json(response);
};