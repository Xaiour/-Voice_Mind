import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async route handlers to catch errors and pass them to Express error handler.
 * Eliminates the need for try-catch in every controller.
 *
 * Usage:
 *   router.get("/users", asyncHandler(async (req, res) => {
 *     const users = await UserService.findAll();
 *     res.json(users);
 *   }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
