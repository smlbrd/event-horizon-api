import { Request, Response, NextFunction } from 'express';

type UserParams = { id: string };
type CreateUserBody = {
  username: string;
  password: string;
  email: string;
  name: string;
};
type UpdateUserBody = {
  email?: string;
  name?: string;
  role?: string;
};

export const createUser =
  (userModel: any) =>
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
      res.status(201).json(user);
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
  (userModel: any) =>
  async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const user = await userModel.getUserById(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error retrieving user', error: error.message });
    }
  };

export const updateUser =
  (userModel: any) =>
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
      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(updated);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error updating user', error: error.message });
    }
  };

export const deleteUser =
  (userModel: any) =>
  async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const deleted = await userModel.deleteUser(Number(id));
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error deleting user', error: error.message });
    }
  };
