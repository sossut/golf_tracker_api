import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import { Club, GetClub, PostClub, PutClub } from '../../interfaces/Club';

const getAllClubs = async (): Promise<Club[]> => {
  const [rows] = await promisePool.query<GetClub[]>(
    `SELECT club_id, club_name
    FROM clubs`
  );
  if (rows.length === 0) {
    throw new CustomError('No clubs found', 404);
  }
  return rows;
};
const getClub = async (id: number): Promise<Club> => {
  const [rows] = await promisePool.execute<GetClub[]>(
    `SELECT club_id, club_name
    FROM clubs
    WHERE club_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('Club not found', 404);
  }
  return rows[0];
};

const postClub = async (data: PostClub) => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO clubs (club_name) 
    VALUES (?)`,
    [data.clubName]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('Club not created', 500);
  }
  return headers.insertId;
};
const putClub = async (data: PutClub, id: number): Promise<Club> => {
  data = { ...data };
  const sql = promisePool.format('UPDATE clubs SET ? WHERE club_id = ?', [
    data,
    id
  ]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Club not found', 404);
  }
  const updatedClub = await getClub(id);
  return updatedClub;
};

const deleteClub = async (id: number): Promise<boolean> => {
  const sql = promisePool.format('DELETE FROM clubs WHERE club_id = ?', [id]);
  const [headers] = await promisePool.query<ResultSetHeader>(sql);
  if (headers.affectedRows === 0) {
    throw new CustomError('Club not found', 404);
  }
  return true;
};

export { getAllClubs, getClub, postClub, putClub, deleteClub };
