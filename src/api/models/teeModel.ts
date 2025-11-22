import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import { Tee, GetTee, PostTee, PutTee } from '../../interfaces/Tee';
import { toSnake } from '../../utils/utilities';

const getAllTees = async (): Promise<Tee[]> => {
  const [rows] = await promisePool.query<GetTee[]>(
    `SELECT tee_id, course_id, tee_name, slope_rating, course_rating, length
    FROM tees`
  );
  if (rows.length === 0) {
    throw new CustomError('No tees found', 404);
  }
  return rows;
};

const getTee = async (id: number): Promise<Tee> => {
  const [rows] = await promisePool.execute<GetTee[]>(
    `SELECT tee_id, course_id, tee_name, length, slope_rating, course_rating
    FROM tees
    WHERE tee_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Tee not found', 404);
  }
  return rows[0];
};

const getTeesByCourseId = async (courseId: number): Promise<Tee[]> => {
  const [rows] = await promisePool.execute<GetTee[]>(
    `SELECT tee_id, course_id, tee_name, length, slope_rating, course_rating
    FROM tees
    WHERE course_id = ?`,
    [courseId]
  );
  if (rows.length === 0) {
    throw new CustomError('Tees not found for this course', 404);
  }
  return rows;
};

const postTee = async (data: PostTee) => {
  const snakeData = toSnake(data);
  const sql = promisePool.format(
    `INSERT INTO tees (course_id, tee_name, length, slope_rating, course_rating)
    VALUES (?, ?, ?, ?, ?)`,
    [
      snakeData.course_id,
      snakeData.tee_name,
      snakeData.length,
      snakeData.slope_rating,
      snakeData.course_rating
    ]
  );
  console.log(sql);
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);

  return headers.insertId;
};

const putTee = async (id: number, data: PutTee) => {
  data = { ...data };
  const sql = promisePool.format('UPDATE tees SET ? WHERE tee_id = ?', [
    toSnake(data),
    id
  ]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  return headers.affectedRows;
};

const deleteTee = async (id: number) => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `DELETE FROM tees 
    WHERE tee_id = ?`,
    [id]
  );
  return headers.affectedRows;
};

export { getAllTees, getTee, getTeesByCourseId, postTee, putTee, deleteTee };
