import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/jwtPayload.types';

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });

      req.user = decoded as JwtPayload;

      next();
    });
  } else {
    res
      .status(401)
      .json({ message: 'Missing or invalid Authorization header' });
  }
}
