export interface UserInput {
  username: string;
  hashed_password: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
}

export interface User extends UserInput {
  id: number;
}

export type UserParams = { user_id: number };

export type CreateUserBody = {
  username: string;
  password: string;
  email: string;
  name: string;
};

export type UpdateUserBody = {
  email?: string;
  name?: string;
  role?: 'user' | 'staff' | 'admin';
};

export interface UserModel {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  addUser(user: UserInput): Promise<User>;
  updateUser(id: number, fields: Partial<UserInput>): Promise<User>;
  deleteUser(id: number): Promise<void>;
}
