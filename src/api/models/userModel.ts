import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import { GetUser, PostUser, PutUser, User } from '../../interfaces/User';
import { toSnake } from '../../utils/utilities';

const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await promisePool.query<GetUser[]>(
    `SELECT users.user_id, user_name, email, role, created_at, updated_at, hcp,
    CONCAT('[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'user_club_id', user_clubs.user_club_id,
          'club_id', clubs.club_id,
          'club_name', clubs.club_name, 
          'in_bag', user_clubs.in_bag, 
          'average_distance', user_clubs.average_distance
        )
      ),
    ']'
    ) AS clubs
    FROM users
    LEFT JOIN user_clubs ON users.user_id = user_clubs.user_id
    LEFT JOIN clubs ON user_clubs.club_id = clubs.club_id
    GROUP BY users.user_id
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No users found', 404);
  }
  const users = rows.map((row) => ({
    ...row,
    clubs: JSON.parse(row.clubs?.toString() || '{}')
  }));
  return users;
};

const getUser = async (id: number): Promise<User> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `SELECT users.user_id, user_name, email, role, created_at, updated_at, hcp,
    CONCAT('[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'user_club_id', user_clubs.user_club_id,
          'club_id', clubs.club_id,
          'club_name', clubs.club_name, 
          'in_bag', user_clubs.in_bag, 
          'average_distance', user_clubs.average_distance
        )
      ),
    ']'
    ) AS clubs
    FROM users
    LEFT JOIN user_clubs ON users.user_id = user_clubs.user_id
    LEFT JOIN clubs ON user_clubs.club_id = clubs.club_id
    GROUP BY users.user_id
    WHERE user_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('User not found', 404);
  }
  const users = rows.map((row) => ({
    ...row,
    clubs: JSON.parse(row.clubs?.toString() || '{}')
  }));
  return users[0];
};

const postUser = async (data: PostUser) => {
  console.log('data', data.username);
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO users (user_name, email, password, hcp)
    VALUES (?, ?, ?, ?)`,
    [data.username, data.email, data.password, data.hcp]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('User not created', 500);
  }
  return headers.insertId.toString();
};

const putUser = async (data: PutUser, id: number): Promise<boolean> => {
  data.updatedAt = new Date();

  data = toSnake(data) as unknown as PutUser;
  console.log(data);
  const sql = promisePool.format('UPDATE users SET ? WHERE user_id = ?', [
    data,
    id
  ]);
  if (data.role) {
    throw new CustomError('Cannot update role via this endpoint', 400);
  }
  console.log(data);
  console.log(sql);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('User not found', 404);
  }
  return true;
};

const deleteUser = async (id: number): Promise<boolean> => {
  const sql = promisePool.format('DELETE FROM users WHERE user_id = ?', [id]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('User not found', 404);
  }
  return true;
};

const getUserLogin = async (email: string): Promise<User> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `SELECT user_id, user_name, email, password, role, created_at, updated_at, hcp
    FROM users
    WHERE email = ?`,
    [email]
  );
  if (rows.length === 0) {
    throw new CustomError('Invalid username or password', 401);
  }
  return rows[0];
};

export { getAllUsers, getUser, postUser, putUser, deleteUser, getUserLogin };
