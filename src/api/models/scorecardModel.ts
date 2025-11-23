import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  Scorecard,
  GetScorecard,
  PostScorecard,
  PutScorecard
} from '../../interfaces/Scorecard';
import { toSnake } from '../../utils/utilities';

const getAllScorecards = async (): Promise<Scorecard[]> => {
  const [rows] = await promisePool.query<GetScorecard[]>(
    `SELECT scorecard_id, user_id, tee_id, scorecard_date, type_of_round, total_score, created_at
    FROM scorecards`
  );
  if (rows.length === 0) {
    throw new CustomError('No scorecards found', 404);
  }
  return rows;
};

const getScorecard = async (id: number): Promise<Scorecard> => {
  const [rows] = await promisePool.execute<GetScorecard[]>(
    `SELECT scorecard_id, user_id, tee_id, scorecard_date, type_of_round, total_score, created_at
    FROM scorecards
    WHERE scorecard_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Scorecard not found', 404);
  }
  return rows[0];
};
const postScorecard = async (data: PostScorecard) => {
  const snakeData = toSnake(data);
  snakeData.scorecard_date = new Date(snakeData.scorecard_date)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  const sql = promisePool.format(
    `INSERT INTO scorecards (user_id, tee_id, scorecard_date, type_of_round)
    VALUES (?, ?, ?, ?)`,
    [
      snakeData.user_id,
      snakeData.tee_id,
      snakeData.scorecard_date,
      snakeData.type_of_round
    ]
  );
  console.log(sql);
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO scorecards (user_id, tee_id, scorecard_date, type_of_round)
    VALUES (?, ?, ?, ?)`,
    [
      snakeData.user_id,
      snakeData.tee_id,
      snakeData.scorecard_date,
      snakeData.type_of_round
    ]
  );
  return headers.insertId;
};
const putScorecard = async (
  data: PutScorecard,
  id: number
): Promise<Scorecard> => {
  const snakeData = toSnake(data);
  const sql = promisePool.format(
    'UPDATE scorecards SET ? WHERE scorecard_id = ?',
    [snakeData, id]
  );
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Scorecard not found', 404);
  }
  return getScorecard(id);
};
const deleteScorecard = async (id: number): Promise<boolean> => {
  const sql = promisePool.format(
    'DELETE FROM scorecards WHERE scorecard_id = ?',
    [id]
  );
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Scorecard not found', 404);
  }
  return true;
};

export {
  getAllScorecards,
  getScorecard,
  postScorecard,
  putScorecard,
  deleteScorecard
};
