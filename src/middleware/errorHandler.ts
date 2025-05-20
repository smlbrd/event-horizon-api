import { Request, Response, NextFunction } from 'express';

export function notFoundErrorHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json({ message: 'Not Found' });
}

export function serverErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
}
