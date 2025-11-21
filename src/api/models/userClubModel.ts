import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  UserClub,
  GetUserClub,
  PostUserClub,
  PutUserClub
} from '../../interfaces/UserClub';
import { toSnake } from '../../utils/utilities';

const getAllUserClubs = async (): Promise<UserClub[]> => {
  const [rows] = await promisePool.query<GetUserClub[]>(
    `SELECT *
    FROM user_clubs`
  );
  if (rows.length === 0) {
    throw new CustomError('No user clubs found', 404);
  }
  return rows;
};

const getUserClub = async (id: number): Promise<UserClub> => {
  const [rows] = await promisePool.execute<GetUserClub[]>(
    `SELECT *
    FROM user_clubs
    WHERE user_club_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('User club not found', 404);
  }
  return rows[0];
};

const getUserClubsByUserId = async (userId: number): Promise<UserClub[]> => {
  const [rows] = await promisePool.execute<GetUserClub[]>(
    `SELECT *
    FROM user_clubs
    WHERE user_id = ?`,
    [userId]
  );
  if (rows.length === 0) {
    throw new CustomError('User clubs not found for this user', 404);
  }
  return rows;
};

const getUserClubByUserIdAndClubId = async (
  userId: number,
  clubId: number
): Promise<UserClub> => {
  const [rows] = await promisePool.execute<GetUserClub[]>(
    `SELECT *
    FROM user_clubs
    WHERE user_id = ? AND club_id = ?`,
    [userId, clubId]
  );
  if (rows.length === 0) {
    throw new CustomError('User clubs not found for this user and club', 404);
  }
  return rows[0];
};

const checkIfUserHasClub = async (
  userId: number,
  clubId: number
): Promise<boolean> => {
  const [rows] = await promisePool.execute<GetUserClub[]>(
    `SELECT user_club_id
    FROM user_clubs
    WHERE user_id = ? AND club_id = ?`,
    [userId, clubId]
  );
  return rows.length > 0;
};

const getUserClubsInBagByUserId = async (
  userId: number
): Promise<UserClub[]> => {
  const [rows] = await promisePool.execute<GetUserClub[]>(
    `SELECT *
    FROM user_clubs
    WHERE user_id = ? AND in_bag = true`,
    [userId]
  );
  if (rows.length === 0) {
    throw new CustomError('User clubs in bag not found for this user', 404);
  }
  return rows;
};

const postUserClub = async (data: PostUserClub) => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO user_clubs (user_id, club_id, in_bag)
    VALUES (?, ?, ?)`,
    [data.userId, data.clubId, data.inBag]
  );
  return headers.insertId;
};
const putUserClub = async (
  data: PutUserClub,
  id: number
): Promise<UserClub> => {
  data = { ...data };
  const snake = toSnake(data) as unknown as PutUserClub;
  const sql = promisePool.format(
    'UPDATE user_clubs SET ? WHERE user_club_id = ?',
    [snake, id]
  );
  console.log(sql);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('User club not found', 404);
  }
  return getUserClub(id);
};

const deleteUserClub = async (id: number): Promise<boolean> => {
  const sql = promisePool.format(
    'DELETE FROM user_clubs WHERE user_club_id = ?',
    [id]
  );
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('User club not found', 404);
  }
  return true;
};
export {
  getAllUserClubs,
  getUserClub,
  getUserClubsByUserId,
  getUserClubsInBagByUserId,
  getUserClubByUserIdAndClubId,
  checkIfUserHasClub,
  postUserClub,
  putUserClub,
  deleteUserClub
};
