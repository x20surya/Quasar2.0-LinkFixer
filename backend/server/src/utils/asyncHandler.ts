import type { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps async route handlers to automatically catch errors and pass them to the error middleware
 * @param fn - The async route handler function
 * @returns A new function that catches errors and passes them to next()
 */
export const asyncHandler = (fn: AsyncFunction) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

