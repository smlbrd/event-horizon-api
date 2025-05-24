import { JwtPayload } from './jwtPayload.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
