import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import { Hole, GetHole, PostHole, PutHole } from '../../interfaces/Hole';
import { toSnake } from '../../utils/utilities';
import { Point } from 'geojson';

const getAllHoles = async (): Promise<Hole[]> => {
  const [rows] = await promisePool.query<GetHole[]>(
    `SELECT hole_id, course_id, hole_number, par, slope_index, green_center_location
    FROM holes`
  );
  if (rows.length === 0) {
    throw new CustomError('No holes found', 404);
  }
  return rows;
};

const getHole = async (id: number): Promise<Hole> => {
  const [rows] = await promisePool.execute<GetHole[]>(
    `SELECT hole_id, course_id, hole_number, par, slope_index, green_center_location
    FROM holes
    WHERE hole_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Hole not found', 404);
  }
  return rows[0];
};

const postHole = async (data: PostHole) => {
  const greenCenter: Point = {
    type: 'Point',
    coordinates: [
      data.greenCenterLocation?.coordinates[0] as number,
      data.greenCenterLocation?.coordinates[1] as number
    ]
  };

  data = { ...data };
  data.greenCenterLocation = greenCenter;
  const snakeData = toSnake(data);
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO holes (course_id, hole_number, par, slope_index, green_center_location)
    VALUES (?, ?, ?, ?, POINT(?, ?))`,
    [
      snakeData.course_id,
      snakeData.hole_number,
      snakeData.par,
      snakeData.slope_index,
      snakeData.green_center_location.coordinates[0],
      snakeData.green_center_location.coordinates[1]
    ]
  );
  return headers.insertId;
};

const putHole = async (data: PutHole, id: number): Promise<Hole> => {
  data = { ...data };
  const sql = promisePool.format('UPDATE holes SET ? WHERE hole_id = ?', [
    toSnake(data),
    id
  ]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Hole not found', 404);
  }
  return getHole(id);
};

const deleteHole = async (id: number): Promise<boolean> => {
  const sql = promisePool.format('DELETE FROM holes WHERE hole_id = ?', [id]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Hole not found', 404);
  }
  return true;
};

export { getAllHoles, getHole, postHole, putHole, deleteHole };
