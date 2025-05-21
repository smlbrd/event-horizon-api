export interface UserInput {
  username: string;
  hashed_password: string;
  email: string;
  name: string;
  role: string;
}

export interface User extends UserInput {
  id: number;
}
