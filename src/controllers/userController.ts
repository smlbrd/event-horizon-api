import { Request, Response, NextFunction } from 'express';
import {
  UserModel,
  UserParams,
  CreateUserBody,
  UpdateUserBody,
} from '../types/user.types';
import { hashPassword } from '../utils/hashPassword';

export const createUser =
  (userModel: UserModel) =>
  async (
    req: Request<{}, {}, CreateUserBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { username, password, email, name } = req.body;
    if (!username || !password || !email || !name) {
      return next({ status: 400, message: 'Missing required user fields' });
    }
    if (password.length < 15 || password.length > 128) {
      return next({
        status: 400,
        message: 'Password must be between 15 and 128 characters',
      });
    }
    try {
      const hashed_password = await hashPassword(password);
      const user = await userModel.addUser({
        username,
        hashed_password,
        email,
        name,
        role: 'user',
      });

      const { hashed_password: _, ...userWithoutPassword } = user;

      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error.code === '23505') {
        return next({
          status: 409,
          message: 'Username or email already exists',
        });
      }
      next(error);
    }
  };

export const getUser =
  (userModel: UserModel) =>
  async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    try {
      const user = await userModel.getUserById(Number(user_id));
      const { hashed_password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      next(error);
    }
  };

export const updateUser =
  (userModel: UserModel) =>
  async (
    req: Request<UserParams, {}, UpdateUserBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { user_id } = req.params;
    const { email, name, role } = req.body;
    try {
      const updated = await userModel.updateUser(Number(user_id), {
        email,
        name,
        role,
      });
      res.status(200).json(updated);
    } catch (error: any) {
      next(error);
    }
  };

export const deleteUser =
  (userModel: UserModel) =>
  async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    try {
      await userModel.deleteUser(Number(user_id));
      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  };
