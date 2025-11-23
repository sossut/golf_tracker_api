import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  HoleStats,
  GetHoleStats,
  PostHoleStats,
  PutHoleStats
} from '../../interfaces/HoleStats';
import { toSnake } from '../../utils/utilities';

const getAllHoleStats = async (): Promise<HoleStats[]> => {
  const [rows] = await promisePool.execute<GetHoleStats[]>(
    `SELECT hole_stats_id, hole_id, scorecard_id, score, fairway_hit, green_in_regulation, putts, penalty_strokes, sand_save, up_and_down
    FROM hole_stats
    WHERE scorecard_id = ?`
  );
  if (rows.length === 0) {
    throw new CustomError('Hole stats not found for this scorecard', 404);
  }
  return rows;
};

const getHoleStats = async (id: number): Promise<HoleStats> => {
  const [rows] = await promisePool.execute<GetHoleStats[]>(
    `SELECT hole_stats_id, hole_id, scorecard_id, score, fairway_hit, green_in_regulation, putts, penalty_strokes, sand_save, up_and_down
    FROM hole_stats
    WHERE hole_stats_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Hole stats not found', 404);
  }
  return rows[0];
};

const postHoleStats = async (data: PostHoleStats) => {
  const snakeData = toSnake(data);
  const sql = promisePool.format(
    `INSERT INTO hole_stats (hole_id, scorecard_id, score, fairway_hit, green_in_regulation, putts, penalty_strokes, sand_save, up_and_down)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      snakeData.hole_id,
      snakeData.scorecard_id,
      snakeData.score,
      snakeData.fairway_hit,
      snakeData.green_in_regulation,
      snakeData.putts,
      snakeData.penalty_strokes,
      snakeData.sand_save,
      snakeData.up_and_down
    ]
  );
  console.log(sql);
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO hole_stats (hole_id, scorecard_id, score, fairway_hit, green_in_regulation, putts, penalty_strokes, sand_save, up_and_down)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      snakeData.hole_id,
      snakeData.scorecard_id,
      snakeData.score,
      snakeData.fairway_hit,
      snakeData.green_in_regulation,
      snakeData.putts,
      snakeData.penalty_strokes,
      snakeData.sand_save,
      snakeData.up_and_down
    ]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('Failed to create hole stats', 500);
  }
  return headers.insertId;
};
const putHoleStats = async (
  data: PutHoleStats,
  id: number
): Promise<HoleStats> => {
  const snakeData = toSnake(data);
  const sql = promisePool.format(
    'UPDATE hole_stats SET ? WHERE hole_stats_id = ?',
    [snakeData, id]
  );
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Hole stats not found', 404);
  }
  return getHoleStats(id);
};

const deleteHoleStats = async (id: number): Promise<boolean> => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `DELETE FROM hole_stats 
    WHERE hole_stats_id = ?`,
    [id]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('Hole stats not found', 404);
  }
  return headers.affectedRows > 0;
};

export {
  getAllHoleStats,
  getHoleStats,
  postHoleStats,
  putHoleStats,
  deleteHoleStats
};
