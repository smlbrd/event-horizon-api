import { Request } from 'express';
import { JwtPayload } from './jwtPayload.types';

export interface AuthReq<P = any, ResBody = any, ReqBody = any, ReqQuery = any>
  extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: JwtPayload;
}
