import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import { Tee, GetTee, PostTee, PutTee } from '../../interfaces/Tee';
import { toSnake } from '../../utils/utilities';

const getAllTees = async (): Promise<Tee[]> => {
  const [rows] = await promisePool.query<GetTee[]>(
    `SELECT
      tees.tee_id,
      tees.course_id,
      tees.tee_name,
      tees.slope_rating,
      tees.course_rating,
      (
  	SELECT
  		SUM(hole_lengths.length)
  		FROM hole_lengths
  		WHERE tees.tee_id = hole_lengths.tee_id
  ) AS course_length,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'hole_id', hole_lengths.hole_id,
            'hole_number', holes.hole_number,
            'length', hole_lengths.length,
            'par', hole_lengths.par,
            'tee_box_location', JSON_OBJECT(
              'x', ST_X(hole_lengths.tee_box_location),
              'y', ST_Y(hole_lengths.tee_box_location)
            )
          )
          ORDER BY holes.hole_number
        ),
        JSON_ARRAY()
      ) AS hole_lengths
    FROM tees
    LEFT JOIN hole_lengths ON tees.tee_id = hole_lengths.tee_id
    LEFT JOIN holes ON hole_lengths.hole_id = holes.hole_id
    LEFT JOIN courses ON tees.course_id = courses.course_id
    GROUP BY 
    tees.tee_id,
    tees.course_id`
  );
  if (rows.length === 0) {
    throw new CustomError('No tees found', 404);
  }

  console.log(rows);

  const tees = rows.map((row) => ({
    ...row,
    hole_lengths: JSON.parse(row.hole_lengths?.toString() || '{}')
  }));
  return tees;
};

const getTee = async (id: number): Promise<Tee> => {
  const [rows] = await promisePool.execute<GetTee[]>(
    `SELECT
  tees.tee_id,
  tees.course_id,
  tees.tee_name,
  tees.slope_rating,
  tees.course_rating,
  (
  	SELECT
  		SUM(hole_lengths.length)
  		FROM hole_lengths
  		WHERE tees.tee_id = hole_lengths.tee_id
  ) AS course_length,
  CONCAT(
    '[',
    
      GROUP_CONCAT(
        JSON_OBJECT(
          'hole_id', hole_lengths.hole_id,
          'hole_number', holes.hole_number,
          'length', hole_lengths.length,
          'par', hole_lengths.par,
          'tee_box_location', JSON_OBJECT(
            'x', ST_X(hole_lengths.tee_box_location),
            'y', ST_Y(hole_lengths.tee_box_location)
          )
        )
        ORDER BY holes.hole_number
      ),
      
    
    ']'
  ) AS hole_lengths
FROM tees
LEFT JOIN hole_lengths ON tees.tee_id = hole_lengths.tee_id
LEFT JOIN holes        ON hole_lengths.hole_id = holes.hole_id
LEFT JOIN courses      ON tees.course_id = courses.course_id
    WHERE tees.tee_id = ?
    GROUP BY tees.tee_id,
    tees.course_id`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Tee not found', 404);
  }
  const tee = rows.map((row) => ({
    ...row,
    hole_lengths: JSON.parse(row.hole_lengths?.toString() || '{}')
  }));
  return tee[0];
};

const getTeesByCourseId = async (courseId: number): Promise<Tee[]> => {
  const [rows] = await promisePool.execute<GetTee[]>(
    `SELECT tee_id, course_id, tee_name,  slope_rating, course_rating
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
    `INSERT INTO tees (course_id, tee_name, slope_rating, course_rating)
    VALUES (?, ?, ?, ?)`,
    [
      snakeData.course_id,
      snakeData.tee_name,
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
