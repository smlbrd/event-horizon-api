import db from '../db/connection';

export async function checkExists(
  table: string,
  id: string | number
): Promise<boolean> {
  const result = await db.query(
    `SELECT 1 FROM ${table} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows.length > 0;
}
