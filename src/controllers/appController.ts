import { Request, Response, NextFunction } from 'express';
import {
  LoginUserBody,
  LoginUserResponse,
  UserModel,
} from '../types/user.types';
import { comparePassword } from '../utils/comparePassword';
import endpoints from '../../endpoints.json';

export const getApi = (req: Request, res: Response) => {
  res.status(200).send({ endpoints });
};

export const loginUser =
  (userModel: UserModel) =>
  async (
    req: Request<{}, {}, LoginUserBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }
    try {
      const user = await userModel.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const match = await comparePassword(password, user.hashed_password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { hashed_password, ...userWithoutPassword } = user;
      res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword,
      } as LoginUserResponse);
    } catch (error) {
      next(error);
    }
  };
