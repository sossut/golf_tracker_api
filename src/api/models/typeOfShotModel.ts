import { promisePool } from '../../database/db';

import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  TypeOfShot,
  GetTypeOfShot,
  PostTypeOfShot,
  PutTypeOfShot
} from '../../interfaces/TypeOfShot';
import { toSnake } from '../../utils/utilities';

const getAllTypeOfShots = async (): Promise<TypeOfShot[]> => {
  const [rows] = await promisePool.query<GetTypeOfShot[]>(
    `SELECT type_of_shot_id, type_of_shot
    FROM type_of_shots`
  );
  if (rows.length === 0) {
    throw new CustomError('No type of shots found', 404);
  }
  return rows;
};

const getTypeOfShot = async (id: number): Promise<TypeOfShot> => {
  const [rows] = await promisePool.execute<GetTypeOfShot[]>(
    `SELECT type_of_shot_id, type_of_shot
    FROM type_of_shots
    WHERE type_of_shot_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Type of shot not found', 404);
  }
  return rows[0];
};

const postTypeOfShot = async (data: PostTypeOfShot) => {
  const snakeData = toSnake(data);
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO type_of_shots (type_of_shot)
    VALUES (?)`,
    [snakeData.type_of_shot]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('Failed to create type of shot', 500);
  }
  return headers.insertId;
};

const putTypeOfShot = async (data: PutTypeOfShot, id: number) => {
  const snakeData = toSnake(data);
  const sql = promisePool.format(
    'UPDATE type_of_shots SET ? WHERE type_of_shot_id = ?',
    [snakeData, id]
  );
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Failed to update type of shot', 500);
  }
  return headers.affectedRows;
};

const deleteTypeOfShot = async (id: number) => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `DELETE FROM type_of_shots 
    WHERE type_of_shot_id = ?`,
    [id]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('Type of shot not found', 404);
  }
  return headers.affectedRows;
};

export {
  getAllTypeOfShots,
  getTypeOfShot,
  postTypeOfShot,
  putTypeOfShot,
  deleteTypeOfShot
};
