import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import { Hole, GetHole, PostHole, PutHole } from '../../interfaces/Hole';
import { toSnake } from '../../utils/utilities';
import { Point } from 'geojson';

const getAllHoles = async (): Promise<Hole[]> => {
  const [rows] = await promisePool.query<GetHole[]>(
    `SELECT hole_id, course_id, hole_number, handicap, green_center_location
    FROM holes`
  );
  if (rows.length === 0) {
    throw new CustomError('No holes found', 404);
  }
  return rows;
};

const getHole = async (id: number): Promise<Hole> => {
  const [rows] = await promisePool.execute<GetHole[]>(
    `SELECT hole_id, course_id, hole_number, handicap, green_center_location
    FROM holes
    WHERE hole_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Hole not found', 404);
  }
  return rows[0];
};

const getHoleIdByCourseAndNumber = async (
  courseId: number,
  holeNumber: number
): Promise<number> => {
  const [rows] = await promisePool.execute<GetHole[]>(
    `SELECT hole_id
    FROM holes
    WHERE course_id = ? AND hole_number = ?`,
    [courseId, holeNumber]
  );
  if (rows.length === 0) {
    throw new CustomError('Hole not found', 404);
  }
  return rows[0].hole_id;
};

const checkIfHoleExists = async (
  courseId: number,
  holeNumber: number
): Promise<boolean> => {
  const [rows] = await promisePool.execute<GetHole[]>(
    `SELECT hole_id
    FROM holes
    WHERE course_id = ? AND hole_number = ?`,
    [courseId, holeNumber]
  );
  return rows.length > 0;
};

const postHole = async (data: PostHole) => {
  const greenCenter: Point = {
    type: 'Point',
    coordinates: [
      (data.greenCenterLocation?.coordinates[0] as number) || 0,
      (data.greenCenterLocation?.coordinates[1] as number) || 0
    ]
  };

  data = { ...data };
  data.greenCenterLocation = greenCenter;
  const snakeData = toSnake(data);
  console.log(snakeData.handicap);
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO holes (course_id, hole_number, handicap, green_center_location)
    VALUES (?, ?, ?, POINT(?, ?))`,
    [
      snakeData.course_id,
      snakeData.hole_number,
      snakeData.handicap,
      snakeData.green_center_location.coordinates[0],
      snakeData.green_center_location.coordinates[1]
    ]
  );
  return headers.insertId;
};

const putHole = async (data: PutHole, id: number): Promise<Hole> => {
  data = { ...data };
  if (data.greenCenterLocation) {
    const greenCenter: Point = {
      type: 'Point',
      coordinates: [
        (data.greenCenterLocation?.coordinates[0] as number) || 0,
        (data.greenCenterLocation?.coordinates[1] as number) || 0
      ]
    };
    data.greenCenterLocation = greenCenter;
    const locationSql = promisePool.format(
      'UPDATE holes SET green_center_location = POINT(?, ?) WHERE hole_id = ?',
      [
        data.greenCenterLocation?.coordinates[0],
        data.greenCenterLocation?.coordinates[1],
        id
      ]
    );
    await promisePool.query(locationSql);
  }

  delete data.greenCenterLocation;

  const sql = promisePool.format('UPDATE holes SET ? WHERE hole_id = ?', [
    toSnake(data),
    id
  ]);
  if (Object.keys(toSnake(data)).length === 0) {
    return getHole(id);
  }
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

export {
  getAllHoles,
  getHole,
  getHoleIdByCourseAndNumber,
  checkIfHoleExists,
  postHole,
  putHole,
  deleteHole
};
