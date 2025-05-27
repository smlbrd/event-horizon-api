import { Request, Response, NextFunction } from 'express';
import {
  LoginUserBody,
  LoginUserResponse,
  UserModel,
} from '../types/user.types';
import { comparePassword } from '../utils/comparePassword';
import endpoints from '../../endpoints.json';
import jwt from 'jsonwebtoken';

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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }
    try {
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Incorrect email or password' });
      }
      const match = await comparePassword(password, user.hashed_password);
      if (!match) {
        return res.status(401).json({ message: 'Incorrect email or password' });
      }

      const { hashed_password, ...userWithoutPassword } = user;

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: userWithoutPassword,
      } as LoginUserResponse & { token: string });
    } catch (error) {
      console.log('Error logging in user:', error);
      next(error);
    }
  };
