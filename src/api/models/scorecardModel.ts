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
    `SELECT
  scorecards.scorecard_id,
  scorecards.user_id,
  scorecards.tee_id,
  scorecards.scorecard_date,
  scorecards.created_at,
  scorecards.type_of_round,
  COALESCE(hlagg.total_par, 0) AS par,
  COALESCE(stats.score, 0) AS total_score,
  JSON_OBJECT(
    'tee_id', tees.tee_id,
    'course_id', tees.course_id,
    'course_name', courses.course_name,
    'tee_name', tees.tee_name,
    'slope_rating', tees.slope_rating,
    'course_rating', tees.course_rating,
    'length', COALESCE(hlagg.total_length, 0)
  ) AS tee,
  JSON_OBJECT(
    'putts', COALESCE(stats.putts, 0),
    'fairway_hit', COALESCE(stats.fairway_hit, 0),
    'left_tee_shots', COALESCE(shot_totals.left_count, 0),
    'right_tee_shots', COALESCE(shot_totals.right_count, 0),
    'middle_tee_shots', COALESCE(shot_totals.middle_count, 0),
    'green_in_regulation', COALESCE(stats.green_in_regulation, 0),
    'penalty_strokes', COALESCE(stats.penalty_strokes, 0),
    'sand_save', COALESCE(stats.sand_save, 0),
    'up_and_down', COALESCE(stats.up_and_down, 0)
  ) AS stats,
  COALESCE(hole_stats_json.hole_stats, '[]') AS hole_stats
FROM scorecards
JOIN tees    ON scorecards.tee_id = tees.tee_id
JOIN courses ON tees.course_id = courses.course_id

LEFT JOIN (
  SELECT
    hole_lengths.tee_id,
    SUM(hole_lengths.length) AS total_length,
    SUM(hole_lengths.par)    AS total_par
  FROM hole_lengths
  JOIN holes ON hole_lengths.hole_id = holes.hole_id
  GROUP BY hole_lengths.tee_id
) AS hlagg ON hlagg.tee_id = tees.tee_id

LEFT JOIN (
  SELECT
    hole_stats.scorecard_id,
    SUM(score) AS score,
    SUM(putts) AS putts,
    SUM(fairway_hit) AS fairway_hit,
    SUM(green_in_regulation) AS green_in_regulation,
    SUM(penalty_strokes) AS penalty_strokes,
    SUM(sand_save) AS sand_save,
    SUM(up_and_down) AS up_and_down
  FROM hole_stats
  GROUP BY hole_stats.scorecard_id
) AS stats ON stats.scorecard_id = scorecards.scorecard_id

LEFT JOIN (
  SELECT
    hs.scorecard_id,
    SUM(CASE WHEN s.left_middle_right = 'left'   AND s.shot_number = 1 AND COALESCE(hl.par, 0) <> 3 THEN 1 ELSE 0 END) AS left_count,
    SUM(CASE WHEN s.left_middle_right = 'middle' AND s.shot_number = 1 AND COALESCE(hl.par, 0) <> 3 THEN 1 ELSE 0 END) AS middle_count,
    SUM(CASE WHEN s.left_middle_right = 'right'  AND s.shot_number = 1 AND COALESCE(hl.par, 0) <> 3 THEN 1 ELSE 0 END) AS right_count
  FROM shots s
  JOIN hole_stats hs ON s.hole_stats_id = hs.hole_stats_id
  JOIN scorecards sc ON hs.scorecard_id = sc.scorecard_id
  LEFT JOIN hole_lengths hl ON hl.hole_id = hs.hole_id AND hl.tee_id = sc.tee_id
  GROUP BY hs.scorecard_id
) AS shot_totals ON shot_totals.scorecard_id = scorecards.scorecard_id

LEFT JOIN (
  -- build a JSON array of hole_stats (each with a nested shots JSON array)
  SELECT
    t.scorecard_id,
    CONCAT('[', GROUP_CONCAT(t.hole_json ORDER BY t.hole_stats_id SEPARATOR ','), ']') AS hole_stats
  FROM (
    SELECT
      hs.scorecard_id,
      hs.hole_stats_id,
      JSON_OBJECT(
        'hole_stats_id', hs.hole_stats_id,
        'hole_id', hs.hole_id,
        'score', hs.score,
        'shots', CONCAT(
          '[',
          IFNULL(
            (SELECT GROUP_CONCAT(
                      JSON_OBJECT(
                        'shot_id', s.shot_id,
                        'shot_number', s.shot_number,
                        'left_middle_right', s.left_middle_right,
                        'type_of_shot_id', s.type_of_shot_id,
                        'location_start', JSON_OBJECT(
                          'x', ST_X(s.location_start),
                          'y', ST_Y(s.location_start)
                        ),
                        'location_end', JSON_OBJECT(
                          'x', ST_X(s.location_end),
                          'y', ST_Y(s.location_end)
                        ),
                        'club_id', s.club_id
                      ) ORDER BY s.shot_number SEPARATOR ','
                   )
             FROM shots s
             WHERE s.hole_stats_id = hs.hole_stats_id
            ), ''
          ),
          ']'
        )
      ) AS hole_json
    FROM hole_stats hs
  ) AS t
  GROUP BY t.scorecard_id
) AS hole_stats_json ON hole_stats_json.scorecard_id = scorecards.scorecard_id

ORDER BY scorecards.created_at DESC;`
  );
  if (rows.length === 0) {
    throw new CustomError('No scorecards found', 404);
  }
  const scorecards = rows.map((row) => {
    const tee = JSON.parse(row.tee?.toString() || '{}');
    const stats = JSON.parse(row.stats?.toString() || '{}');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const hole_stats = JSON.parse(row.hole_stats?.toString() || '[]');
    const shots = hole_stats.map((hs: any) => {
      return {
        ...hs,
        shots: JSON.parse(hs.shots || '[]')
      };
    });
    tee.course_rating = Number(tee.course_rating) / 10 || 0;
    return { ...row, tee, stats, hole_stats: shots };
  });
  return scorecards;
};

const getScorecard = async (id: number): Promise<Scorecard> => {
  const [rows] = await promisePool.execute<GetScorecard[]>(
    `SELECT
  scorecards.scorecard_id,
  scorecards.user_id,
  scorecards.tee_id,
  scorecards.scorecard_date,
  scorecards.created_at,
  scorecards.type_of_round,
  COALESCE(hlagg.total_par, 0) AS par,
  COALESCE(stats.score, 0) AS total_score,
  JSON_OBJECT(
    'tee_id', tees.tee_id,
    'course_id', tees.course_id,
    'course_name', courses.course_name,
    'tee_name', tees.tee_name,
    'slope_rating', tees.slope_rating,
    'course_rating', tees.course_rating,
    'length', COALESCE(hlagg.total_length, 0)
  ) AS tee,
  JSON_OBJECT(
    'putts', COALESCE(stats.putts, 0),
    'fairway_hit', COALESCE(stats.fairway_hit, 0),
    'left_tee_shots', COALESCE(shot_totals.left_count, 0),
    'right_tee_shots', COALESCE(shot_totals.right_count, 0),
    'middle_tee_shots', COALESCE(shot_totals.middle_count, 0),
    'green_in_regulation', COALESCE(stats.green_in_regulation, 0),
    'penalty_strokes', COALESCE(stats.penalty_strokes, 0),
    'sand_save', COALESCE(stats.sand_save, 0),
    'up_and_down', COALESCE(stats.up_and_down, 0)
  ) AS stats,
  COALESCE(hole_stats_json.hole_stats, '[]') AS hole_stats
FROM scorecards
JOIN tees    ON scorecards.tee_id = tees.tee_id
JOIN courses ON tees.course_id = courses.course_id

LEFT JOIN (
  SELECT
    hole_lengths.tee_id,
    SUM(hole_lengths.length) AS total_length,
    SUM(hole_lengths.par)    AS total_par
  FROM hole_lengths
  JOIN holes ON hole_lengths.hole_id = holes.hole_id
  GROUP BY hole_lengths.tee_id
) AS hlagg ON hlagg.tee_id = tees.tee_id

LEFT JOIN (
  SELECT
    hole_stats.scorecard_id,
    SUM(score) AS score,
    SUM(putts) AS putts,
    SUM(fairway_hit) AS fairway_hit,
    SUM(green_in_regulation) AS green_in_regulation,
    SUM(penalty_strokes) AS penalty_strokes,
    SUM(sand_save) AS sand_save,
    SUM(up_and_down) AS up_and_down
  FROM hole_stats
  GROUP BY hole_stats.scorecard_id
) AS stats ON stats.scorecard_id = scorecards.scorecard_id

LEFT JOIN (
  SELECT
    hs.scorecard_id,
    SUM(CASE WHEN s.left_middle_right = 'left'   AND s.shot_number = 1 AND COALESCE(hl.par, 0) <> 3 THEN 1 ELSE 0 END) AS left_count,
    SUM(CASE WHEN s.left_middle_right = 'middle' AND s.shot_number = 1 AND COALESCE(hl.par, 0) <> 3 THEN 1 ELSE 0 END) AS middle_count,
    SUM(CASE WHEN s.left_middle_right = 'right'  AND s.shot_number = 1 AND COALESCE(hl.par, 0) <> 3 THEN 1 ELSE 0 END) AS right_count
  FROM shots s
  JOIN hole_stats hs ON s.hole_stats_id = hs.hole_stats_id
  JOIN scorecards sc ON hs.scorecard_id = sc.scorecard_id
  LEFT JOIN hole_lengths hl ON hl.hole_id = hs.hole_id AND hl.tee_id = sc.tee_id
  GROUP BY hs.scorecard_id
) AS shot_totals ON shot_totals.scorecard_id = scorecards.scorecard_id

LEFT JOIN (
  -- build a JSON array of hole_stats (each with a nested shots JSON array)
  SELECT
    t.scorecard_id,
    CONCAT('[', GROUP_CONCAT(t.hole_json ORDER BY t.hole_stats_id SEPARATOR ','), ']') AS hole_stats
  FROM (
    SELECT
      hs.scorecard_id,
      hs.hole_stats_id,
      JSON_OBJECT(
        'hole_stats_id', hs.hole_stats_id,
        'hole_id', hs.hole_id,
        'score', hs.score,
        'shots', CONCAT(
          '[',
          IFNULL(
            (SELECT GROUP_CONCAT(
                      JSON_OBJECT(
                        'shot_id', s.shot_id,
                        'shot_number', s.shot_number,
                        'left_middle_right', s.left_middle_right,
                        'type_of_shot_id', s.type_of_shot_id,
                        'location_start', JSON_OBJECT(
                          'x', ST_X(s.location_start),
                          'y', ST_Y(s.location_start)
                        ),
                        'location_end', JSON_OBJECT(
                          'x', ST_X(s.location_end),
                          'y', ST_Y(s.location_end)
                        ),
                        'club_id', s.club_id
                      ) ORDER BY s.shot_number SEPARATOR ','
                   )
             FROM shots s
             WHERE s.hole_stats_id = hs.hole_stats_id
            ), ''
          ),
          ']'
        )
      ) AS hole_json
    FROM hole_stats hs
  ) AS t
  GROUP BY t.scorecard_id
) AS hole_stats_json ON hole_stats_json.scorecard_id = scorecards.scorecard_id
WHERE scorecards.scorecard_id = ?
ORDER BY scorecards.created_at DESC;`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Scorecard not found', 404);
  }
  const scorecards = rows.map((row) => {
    const tee = JSON.parse(row.tee?.toString() || '{}');

    const stats = JSON.parse(row.stats?.toString() || '{}');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const hole_stats = JSON.parse(row.hole_stats?.toString() || '[]');
    const shots = hole_stats.map((hs: any) => {
      return {
        ...hs,
        shots: JSON.parse(hs.shots || '[]')
      };
    });
    tee.course_rating = Number(tee.course_rating) / 10 || 0;
    return { ...row, tee, stats, hole_stats: shots };
  });
  return scorecards[0];
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
