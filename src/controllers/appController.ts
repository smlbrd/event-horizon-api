import { Request, Response } from 'express';
import endpoints from '../../endpoints.json';

export const getApi = (req: Request, res: Response) => {
  res.status(200).send({ endpoints });
};
