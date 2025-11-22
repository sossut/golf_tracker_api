import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  Course,
  GetCourse,
  PostCourse,
  PutCourse
} from '../../interfaces/Course';
import { toSnake } from '../../utils/utilities';

const getAllCourses = async (): Promise<Course[]> => {
  const [rows] = await promisePool.query<GetCourse[]>(
    `SELECT courses.course_id, course_name, establishment_id, scorecard,
    CONCAT('[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'tee_id', tees.tee_id,
          'tee_name', tees.tee_name, 
          'slope_rating', tees.slope_rating,
          'course_rating', tees.course_rating,
          'length', tees.length
        )
      ),
    ']'
    ) AS tees
    FROM courses
    LEFT JOIN tees ON courses.course_id = tees.course_id
    GROUP BY courses.course_id`
  );
  if (rows.length === 0) {
    throw new CustomError('No courses found', 404);
  }
  const courses = rows.map((row) => ({
    ...row,
    tees: JSON.parse(row.tees?.toString() || '{}')
  }));
  return courses;
};

const getCourse = async (id: number): Promise<Course> => {
  const [rows] = await promisePool.execute<GetCourse[]>(
    `SELECT courses.course_id, course_name, establishment_id, scorecard,
    CONCAT('[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'tee_id', tees.tee_id,
          'tee_name', tees.tee_name, 
          'slope_rating', tees.slope_rating,
          'course_rating', tees.course_rating,
          'length', tees.length
        )
      ),
    ']'
    ) AS tees
    FROM courses
    LEFT JOIN tees ON courses.course_id = tees.course_id
    GROUP BY courses.course_id
    WHERE courses.course_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Course not found', 404);
  }
  const course = rows.map((row) => ({
    ...row,
    tees: JSON.parse(row.tees?.toString() || '{}')
  }));
  return course[0];
};

const postCourse = async (data: PostCourse) => {
  const snakeData = toSnake(data);

  const sql = promisePool.format(
    `INSERT INTO courses (course_name, establishment_id)
    VALUES (?, ?)`,
    [snakeData.course_name, snakeData.establishment_id]
  );

  const [headers] = await promisePool.execute<ResultSetHeader>(sql);
  return headers.insertId;
};
const putCourse = async (data: PutCourse, id: number): Promise<Course> => {
  data = { ...data };
  const sql = promisePool.format('UPDATE courses SET ? WHERE course_id = ?', [
    toSnake(data),
    id
  ]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Course not found', 404);
  }
  return getCourse(id);
};

const deleteCourse = async (id: number): Promise<boolean> => {
  const sql = promisePool.format('DELETE FROM courses WHERE course_id = ?', [
    id
  ]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Course not found', 404);
  }
  return true;
};

export { getAllCourses, getCourse, postCourse, putCourse, deleteCourse };
