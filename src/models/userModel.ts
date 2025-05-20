import db from '../db/connection';
import { UserInput, User } from '../types/User';

export const userModel = {
  async addUser(user: UserInput): Promise<User> {
    const { username, hashed_password, email, name, role } = user;
    const result = await db.query(
      `INSERT INTO users (username, hashed_password, email, name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, name, role`,
      [username, hashed_password, email, name, role]
    );
    return result.rows[0];
  },

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.query(
      'SELECT id, username, email, name, role FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async updateUser(
    id: number,
    fields: Partial<Pick<User, 'email' | 'name' | 'role'>>
  ): Promise<User | undefined> {
    const result = await db.query(
      `UPDATE users SET email = $1, name = $2, role = $3 WHERE id = $4 RETURNING id, username, email, name, role`,
      [fields.email, fields.name, fields.role, id]
    );
    return result.rows[0];
  },

  async deleteUser(id: number): Promise<{ id: number } | undefined> {
    const result = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0];
  },
};
