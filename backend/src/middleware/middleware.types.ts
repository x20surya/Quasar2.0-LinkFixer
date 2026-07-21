import type { NextFunction, Request, Response } from "express";

export type middlewareFn = ( req : Request, res : Response, next: NextFunction) => void