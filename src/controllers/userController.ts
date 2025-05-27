import { Request, Response, NextFunction } from 'express';
import {
  UserModel,
  UserParams,
  CreateUserBody,
  UpdateUserBody,
} from '../types/user.types';
import { hashPassword } from '../utils/hashPassword';
import { validateEmail } from '../utils/validateEmail';
import jwt from 'jsonwebtoken';

export const createUser =
  (userModel: UserModel) =>
  async (
    req: Request<{}, {}, CreateUserBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next({ status: 400, message: 'Missing required user fields' });
    }
    if (!validateEmail(email)) {
      return next({ status: 400, message: 'Invalid email format' });
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
        email,
        hashed_password,
        role: 'user',
      });

      const { hashed_password: _, ...userWithoutPassword } = user;

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        message: 'Signup successful',
        token,
        ...userWithoutPassword,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        return next({
          status: 409,
          message: 'An account with this email already exists',
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
      const user = await userModel.getUserById(user_id);
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
    const { email, role } = req.body;
    try {
      const updateFields: Partial<{
        email: string;
        role: 'user' | 'staff' | 'admin';
      }> = {};
      if (email !== undefined) updateFields.email = email;
      if (role !== undefined)
        updateFields.role = role as 'user' | 'staff' | 'admin';

      const updated = await userModel.updateUser(user_id, updateFields);
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
      await userModel.deleteUser(user_id);
      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  };
