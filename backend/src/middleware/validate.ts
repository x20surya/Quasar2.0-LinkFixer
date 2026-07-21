import type { NextFunction, Request, Response } from 'express';
import { ZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        next();
    } catch (error: any) {
        if (error instanceof ZodError) {
            // Format validation errors to show which fields failed and why
            const formattedErrors = error.issues.map((issue) => {
                const path = issue.path.join('.');
                const errorDetail: any = {
                    field: path || 'unknown',
                    message: issue.message,
                    code: issue.code,
                };

                // Add type information for invalid_type errors
                if (issue.code === 'invalid_type') {
                    errorDetail.expected = issue.expected;
                    errorDetail.received = (issue as any).received;
                }

                return errorDetail;
            });

            const validationError = new AppError('Schema Validation Failed', 400);
            (validationError as any).validationErrors = formattedErrors;
            return next(validationError);
        }
        return next(error);
    }
}