import db from '../db/connection';
import { UserModel, User, UserInput } from '../types/user.types';
import { checkExists } from '../utils/checkExists';
import { makeError } from '../utils/makeError';

export const userModel: UserModel = {
  async getUsers(): Promise<User[]> {
    const result = await db.query('SELECT * FROM users');

    return result.rows;
  },

  async getUserById(id: number): Promise<User> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);

    if (!result.rows[0]) throw makeError('User not found', 404);

    return result.rows[0];
  },

  async addUser(user: UserInput): Promise<User> {
    const { username, hashed_password, email, name, role } = user;

    const result = await db.query(
      `INSERT INTO users (username, hashed_password, email, name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [username, hashed_password, email, name, role]
    );

    return result.rows[0];
  },

  async updateUser(
    id: number,
    fields: Partial<Pick<User, 'email' | 'name' | 'role'>>
  ): Promise<User> {
    const keys = Object.keys(fields);

    if (keys.length === 0)
      throw makeError('No fields provided for update', 400);

    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = keys.map((key) => (fields as any)[key]);
    values.push(id);

    const result = await db.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!result.rows[0]) throw makeError('User not found', 404);

    return result.rows[0];
  },

  async deleteUser(id: number): Promise<void> {
    if (!(await checkExists('users', id))) {
      throw makeError('User not found', 404);
    }
    await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  },
};
