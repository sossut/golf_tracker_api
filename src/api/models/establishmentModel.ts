import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  Establishment,
  GetEstablishment,
  PostEstablishment,
  PutEstablishment
} from '../../interfaces/Establishment';
import { toSnake } from '../../utils/utilities';
import { Point } from 'geojson';

const getAllEstablishments = async (): Promise<Establishment[]> => {
  const [rows] = await promisePool.query<GetEstablishment[]>(
    `SELECT establishments.establishment_id, establishment_name, 
    location, abbreviation, establishment_number,
    CONCAT('[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'course_id', courses.course_id,
          'course_name', courses.course_name,
          'scorecard', courses.scorecard,
          'tees', (
            SELECT CONCAT('[',
              GROUP_CONCAT(
                JSON_OBJECT(
                'tee_id', tees.tee_id,
                'tee_name', tees.tee_name, 
                'slope_rating', tees.slope_rating,
                'course_rating', tees.course_rating
                )
              ),
            ']')
            FROM tees
            WHERE courses.course_id = tees.course_id
          )
        )
      ),
    ']') AS courses
      FROM establishments
    LEFT JOIN courses ON establishments.establishment_id = courses.establishment_id
    GROUP BY establishments.establishment_id`
  );
  if (rows.length === 0) {
    throw new CustomError('No establishments found', 404);
  }

  const establishments = rows.map((row) => {
    const courses = JSON.parse(row.courses?.toString() || '{}');
    const tees = courses.map((course: any) => {
      return {
        ...course,
        tees: JSON.parse(course.tees?.toString() || '{}')
      };
    });
    return {
      ...row,
      courses: tees
    };
  });
  return establishments;
};

const getEstablishment = async (id: number): Promise<Establishment> => {
  const [rows] = await promisePool.execute<GetEstablishment[]>(
    `SELECT establishments.establishment_id, establishment_name, 
    location, abbreviation, establishment_number,
    CONCAT('[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'course_id', courses.course_id,
          'course_name', courses.course_name,
          'scorecard', courses.scorecard,
          'tees', (
            SELECT CONCAT('[',
              GROUP_CONCAT(
                JSON_OBJECT(
                'tee_id', tees.tee_id,
                'tee_name', tees.tee_name, 
                'slope_rating', tees.slope_rating,
                'course_rating', tees.course_rating
                )
              ),
            ']')
            FROM tees
            WHERE courses.course_id = tees.course_id
          )
        )
      ),
    ']') AS courses
      FROM establishments
    LEFT JOIN courses ON establishments.establishment_id = courses.establishment_id
    WHERE establishments.establishment_id = ?
    GROUP BY establishments.establishment_id`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Establishment not found', 404);
  }
  const establishments = rows.map((row) => {
    const courses = JSON.parse(row.courses?.toString() || '{}');
    const tees = courses.map((course: any) => {
      return {
        ...course,
        tees: JSON.parse(course.tees?.toString() || '{}')
      };
    });
    return {
      ...row,
      courses: tees
    };
  });
  return establishments[0];
};
const getEstablishmentByLocation = async (
  longitude: string,
  latitude: string
): Promise<Establishment> => {
  const sql = promisePool.format(
    `SELECT establishments.establishment_id, establishment_name, 
    location, abbreviation, establishment_number,
    CONCAT('[',
      GROUP_CONCAT(
        JSON_OBJECT(
          'course_id', courses.course_id,
          'course_name', courses.course_name,
          'scorecard', courses.scorecard,
          'tees', (
            SELECT CONCAT('[',
              GROUP_CONCAT(
                JSON_OBJECT(
                'tee_id', tees.tee_id,
                'tee_name', tees.tee_name, 
                'slope_rating', tees.slope_rating,
                'course_rating', tees.course_rating
                )
              ),
            ']')
            FROM tees
            WHERE courses.course_id = tees.course_id
          )
        )
      ),
    ']') AS courses
      FROM establishments
    LEFT JOIN courses ON establishments.establishment_id = courses.establishment_id
    WHERE ST_Distance_Sphere(location, POINT(?, ?)) < 1000
    GROUP BY establishments.establishment_id`,
    [Number(longitude), Number(latitude)]
  );
  const [rows] = await promisePool.execute<GetEstablishment[]>(sql);
  if (rows.length === 0) {
    throw new CustomError('Establishment not found', 404);
  }
  const establishments = rows.map((row) => {
    const courses = JSON.parse(row.courses?.toString() || '{}');
    const tees = courses.map((course: any) => {
      return {
        ...course,
        tees: JSON.parse(course.tees?.toString() || '{}')
      };
    });
    return {
      ...row,
      courses: tees
    };
  });
  return establishments[0];
};

const postEstablishment = async (data: PostEstablishment) => {
  const location: Point = {
    type: 'Point',
    coordinates: [data.location.coordinates[0], data.location.coordinates[1]]
  };

  const snakeData = toSnake(data);
  snakeData.location = location;

  const sql = promisePool.format(
    `INSERT INTO establishments (establishment_name, location, abbreviation, establishment_number)
     VALUES (?, POINT(?, ?), ?, ?)`,
    [
      snakeData.establishment_name,
      // provide longitude (x) first, then latitude (y)
      snakeData.location.coordinates[0],
      snakeData.location.coordinates[1],
      snakeData.abbreviation,
      snakeData.establishment_number
    ]
  );
  console.log(sql);
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);
  return headers.insertId;
};
const putEstablishment = async (
  data: PutEstablishment,
  id: number
): Promise<Establishment> => {
  data = { ...data };
  const snakeData = toSnake(data);
  delete snakeData.location;
  const sql = promisePool.format(
    'UPDATE establishments SET ? WHERE establishment_id = ?',
    [snakeData, id]
  );
  console.log(sql);
  if (data.location) {
    const locationSql = promisePool.format(
      'UPDATE establishments SET location = POINT(?, ?) WHERE establishment_id = ?',
      [data.location.coordinates[0], data.location.coordinates[1], id]
    );
    await promisePool.query(locationSql);
  }
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Establishment not found', 404);
  }
  return getEstablishment(id);
};

const deleteEstablishment = async (id: number): Promise<boolean> => {
  const sql = promisePool.format(
    'DELETE FROM establishments WHERE establishment_id = ?',
    [id]
  );
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Establishment not found', 404);
  }
  return true;
};
export {
  getAllEstablishments,
  getEstablishment,
  getEstablishmentByLocation,
  postEstablishment,
  putEstablishment,
  deleteEstablishment
};
