import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  HoleLength,
  GetHoleLength,
  PostHoleLength,
  PutHoleLength
} from '../../interfaces/HoleLength';
import { toSnake } from '../../utils/utilities';
import { Point } from 'geojson';

const getAllHoleLengths = async (): Promise<HoleLength[]> => {
  const [rows] = await promisePool.query<GetHoleLength[]>(
    `SELECT hole_length_id, hole_id, tee_id, length, tee_box_location, par
      FROM hole_lengths`
  );
  if (rows.length === 0) {
    throw new CustomError('No hole lengths found', 404);
  }
  return rows;
};

const getHoleLength = async (id: number): Promise<HoleLength> => {
  const [rows] = await promisePool.execute<GetHoleLength[]>(
    `SELECT hole_length_id, hole_id, tee_id, length, tee_box_location, par
    FROM hole_lengths
    WHERE hole_length_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Hole length not found', 404);
  }
  return rows[0];
};

const postHoleLength = async (
  holeLengthData: PostHoleLength
): Promise<number> => {
  console.log(holeLengthData.teeBoxLocation.coordinates);
  const location: Point = {
    type: 'Point',
    coordinates: [
      holeLengthData.teeBoxLocation?.coordinates[0] as number,
      holeLengthData.teeBoxLocation?.coordinates[1] as number
    ]
  };
  const snakeCaseData = toSnake(holeLengthData);
  snakeCaseData.tee_box_location = location;
  const sql = promisePool.format(
    `INSERT INTO hole_lengths (hole_id, tee_id, length, tee_box_location, par)
    VALUES (?, ?, ?, POINT(?, ?), ?)`,
    [
      snakeCaseData.hole_id,
      snakeCaseData.tee_id,
      snakeCaseData.length,
      snakeCaseData.tee_box_location.coordinates[0],
      snakeCaseData.tee_box_location.coordinates[1],
      snakeCaseData.par
    ]
  );
  console.log(sql);
  const [result] = await promisePool.execute<ResultSetHeader>(sql);
  return result.insertId;
};

const putHoleLength = async (
  holeLengthData: PutHoleLength,
  id: number
): Promise<boolean> => {
  const snakeCaseData = toSnake(holeLengthData);
  const fields = Object.keys(snakeCaseData)
    .map((key) => {
      if (key === 'tee_box_location') {
        return `${key} = ST_GeomFromGeoJSON(?)`;
      } else {
        return `${key} = ?`;
      }
    })
    .join(', ');
  const values = Object.values(snakeCaseData);
  values.push(id);
  const [result] = await promisePool.execute<ResultSetHeader>(
    `UPDATE hole_lengths SET ${fields} WHERE hole_length_id = ?`,
    values
  );
  if (result.affectedRows === 0) {
    throw new CustomError('Hole length not found', 404);
  }
  return true;
};
const deleteHoleLength = async (id: number): Promise<boolean> => {
  const [result] = await promisePool.execute<ResultSetHeader>(
    `DELETE FROM hole_lengths 
    WHERE hole_length_id = ?`,
    [id]
  );
  if (result.affectedRows === 0) {
    throw new CustomError('Hole length not found', 404);
  }
  return true;
};
export {
  getAllHoleLengths,
  getHoleLength,
  postHoleLength,
  putHoleLength,
  deleteHoleLength
};
