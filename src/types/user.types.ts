export interface UserSeedInput {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
}

export interface UserInput {
  email: string;
  hashed_password: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
}

export interface User extends UserInput {
  id: string;
}

export type UserParams = { user_id: string };

export type CreateUserBody = {
  email: string;
  password: string;
  name: string;
};

export type UpdateUserBody = {
  email?: string;
  name?: string;
  role?: 'user' | 'staff' | 'admin';
};

export type LoginUserBody = {
  email: string;
  password: string;
};

export type LoginUserResponse = {
  message: string;
  user: Omit<User, 'hashed_password'>;
};

export interface UserModel {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  addUser(user: UserInput): Promise<User>;
  updateUser(id: string, fields: Partial<UserInput>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
