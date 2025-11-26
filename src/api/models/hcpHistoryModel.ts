import { promisePool } from '../../database/db';
import CustomError from '../../classes/CustomError';
import { ResultSetHeader } from 'mysql2';
import {
  HcpHistory,
  GetHcpHistory,
  PostHcpHistory,
  PutHcpHistory
} from '../../interfaces/HcpHistory';
import { toSnake } from '../../utils/utilities';

const getAllHcpHistory = async (userId: number): Promise<HcpHistory[]> => {
  const [rows] = await promisePool.execute<GetHcpHistory[]>(
    `SELECT hcp_history_id, user_id, hcp, hcp_date
    FROM hcp_histories
    WHERE user_id = ?`,
    [userId]
  );
  if (rows.length === 0) {
    throw new CustomError('HCP history not found for this user', 404);
  }
  return rows;
};

const getHcpHistory = async (id: number): Promise<HcpHistory> => {
  const [rows] = await promisePool.execute<GetHcpHistory[]>(
    `SELECT hcp_history_id, user_id, hcp, hcp_date
    FROM hcp_histories
    WHERE hcp_history_id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new CustomError('HCP history entry not found', 404);
  }
  return rows[0];
};

const postHcpHistory = async (
  hcpHistoryData: PostHcpHistory
): Promise<HcpHistory> => {
  const snakeCaseData = toSnake(hcpHistoryData);
  const [result] = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO hcp_histories (user_id, hcp, hcp_date)
    VALUES (?, ?, ?)`,
    [snakeCaseData.user_id, snakeCaseData.hcp, snakeCaseData.hcp_date]
  );
  const insertedId = result.insertId;
  if (result.affectedRows === 0) {
    throw new CustomError('Failed to create HCP history entry', 500);
  }
  return getHcpHistory(insertedId);
};

const putHcpHistory = async (
  id: number,
  hcpHistoryData: PutHcpHistory
): Promise<HcpHistory> => {
  const snakeCaseData = toSnake(hcpHistoryData);
  const fields = Object.keys(snakeCaseData)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(snakeCaseData);
  values.push(id);
  const [result] = await promisePool.execute<ResultSetHeader>(
    `UPDATE hcp_history
    SET ${fields}
    WHERE hcp_history_id = ?`,
    values
  );
  if (result.affectedRows === 0) {
    throw new CustomError(
      'HCP history entry not found or no changes made',
      404
    );
  }
  return getHcpHistory(id);
};
export { getAllHcpHistory, getHcpHistory, postHcpHistory, putHcpHistory };
