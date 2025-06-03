import db from '../db/connection';
import { UserModel, User, UserInput } from '../types/user.types';
import { checkExists } from '../utils/checkExists';
import { makeError } from '../utils/makeError';

export const userModel: UserModel = {
  async getUsers(): Promise<User[]> {
    const result = await db.query('SELECT * FROM users');

    return result.rows;
  },

  async getUserById(id: string): Promise<User> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);

    if (!result.rows[0]) throw makeError('User not found', 404);

    return result.rows[0];
  },

  async getUserByEmail(email: string): Promise<User> {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (!result.rows[0]) throw makeError('Incorrect email or password', 401);

    return result.rows[0];
  },

  async addUser(user: UserInput): Promise<User> {
    const { email, hashed_password, name, role } = user;

    const result = await db.query(
      `INSERT INTO users (email, hashed_password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [email, hashed_password, name, role]
    );

    return result.rows[0];
  },

  async updateUser(
    id: string,
    fields: Partial<Pick<User, 'email' | 'name'>>
  ): Promise<User> {
    const keys = Object.keys(fields);

    if (keys.length === 0)
      throw makeError('No fields provided for update', 400);

    const allowed = ['email', 'name'];

    for (const key of keys) {
      if (!allowed.includes(key)) {
        throw makeError(`Cannot update field: ${key}`, 400);
      }
    }

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

  async deleteUser(id: string): Promise<void> {
    if (!(await checkExists('users', id))) {
      throw makeError('User not found', 404);
    }
    await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  },
};
