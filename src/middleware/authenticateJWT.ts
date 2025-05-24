import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });

      (req as any).user = user;

      next();
    });
  } else {
    res
      .status(401)
      .json({ message: 'Missing or invalid Authorization header' });
  }
}
