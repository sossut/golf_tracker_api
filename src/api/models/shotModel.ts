import { promisePool } from '../../database/db';

import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import { Shot, GetShot, PostShot, PutShot } from '../../interfaces/Shot';
import { toSnake } from '../../utils/utilities';
import { Point } from 'geojson';

const getAllShots = async (): Promise<Shot[]> => {
  const [rows] = await promisePool.query<GetShot[]>(
    `SELECT shot_id, hole_stats_id, type_of_shot_id, club_id,
    left_middle_right, short_center_long, in_hole, shot_number, location_start, location_end
    FROM shots`
  );
  if (rows.length === 0) {
    throw new CustomError('No shots found', 404);
  }

  return rows;
};
const getShot = async (id: number): Promise<Shot> => {
  const [rows] = await promisePool.execute<GetShot[]>(
    `SELECT shot_id, hole_stats_id, type_of_shot_id, club_id,
    left_middle_right, short_center_long, in_hole, shot_number, location_start, location_end
    FROM shots WHERE shot_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Shot not found', 404);
  }

  return rows[0];
};

const getShotIdsByHoleStatsId = async (
  holeStatsId: number
): Promise<number[]> => {
  const [rows] = await promisePool.execute<GetShot[]>(
    `SELECT shot_id FROM shots
     WHERE hole_stats_id = ?`,
    [holeStatsId]
  );
  if (rows.length === 0) {
    throw new CustomError('Shots not found for this hole stats', 404);
  }
  return rows.map((row) => row.shot_id);
};

const postShot = async (data: PostShot) => {
  const locationStart: Point = {
    type: 'Point',
    coordinates: [
      data.locationStart?.coordinates[0] as number,
      data.locationStart?.coordinates[1] as number
    ]
  };
  const locationEnd: Point = {
    type: 'Point',
    coordinates: [
      data.locationEnd?.coordinates[0] as number,
      data.locationEnd?.coordinates[1] as number
    ]
  };
  const snakeData = toSnake(data);
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO shots (hole_stats_id, type_of_shot_id, club_id,
    left_middle_right, short_center_long, in_hole, shot_number, location_start, location_end)
    VALUES (?, ?, ?, ?, ?, ?, ?, POINT(?, ?), POINT(?, ?))`,
    [
      snakeData.hole_stats_id,
      snakeData.type_of_shot_id,
      snakeData.club_id,
      snakeData.left_middle_right,
      snakeData.short_center_long,
      snakeData.in_hole,
      snakeData.shot_number,
      locationStart.coordinates[0],
      locationStart.coordinates[1],
      locationEnd.coordinates[0],
      locationEnd.coordinates[1]
    ]
  );
  return headers.insertId;
};
const putShot = async (data: PutShot, id: number) => {
  const snakeData = toSnake(data);
  const sql = promisePool.format('UPDATE shots SET ? WHERE shot_id = ?', [
    snakeData,
    id
  ]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Shot not found', 404);
  }
  return headers.affectedRows;
};
const deleteShot = async (id: number) => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `DELETE FROM shots 
    WHERE shot_id = ?`,
    [id]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('Shot not found', 404);
  }
  return headers.affectedRows;
};

export {
  getAllShots,
  getShot,
  getShotIdsByHoleStatsId,
  postShot,
  putShot,
  deleteShot
};
