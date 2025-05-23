import { Request, Response, NextFunction } from 'express';
import {
  UserModel,
  UserParams,
  CreateUserBody,
  UpdateUserBody,
} from '../types/user.types';

export const createUser =
  (userModel: UserModel) =>
  async (
    req: Request<{}, {}, CreateUserBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { username, password, email, name } = req.body;
    if (!username || !password || !email || !name) {
      return res.status(400).json({ message: 'Missing required user fields' });
    }
    try {
      const hashed_password = password;
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
        return res
          .status(409)
          .json({ message: 'Username or email already exists' });
      }
      res
        .status(500)
        .json({ message: 'Error creating user', error: error.message });
    }
  };

export const getUser =
  (userModel: UserModel) =>
  async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const user = await userModel.getUserById(Number(id));
      const { hashed_password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ message: 'User not found' });
      }
      res
        .status(500)
        .json({ message: 'Error retrieving user', error: error.message });
    }
  };

export const updateUser =
  (userModel: UserModel) =>
  async (
    req: Request<UserParams, {}, UpdateUserBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { email, name, role } = req.body;
    try {
      const updated = await userModel.updateUser(Number(id), {
        email,
        name,
        role,
      });
      res.status(200).json(updated);
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ message: 'User not found' });
      }
      res
        .status(500)
        .json({ message: 'Error updating user', error: error.message });
    }
  };

export const deleteUser =
  (userModel: UserModel) =>
  async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      await userModel.deleteUser(Number(id));
      res.status(204).send();
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ message: 'User not found' });
      }
      res
        .status(500)
        .json({ message: 'Error deleting user', error: error.message });
    }
  };
