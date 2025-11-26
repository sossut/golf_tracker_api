import { RowDataPacket } from 'mysql2';
import { User } from './User';

interface HcpHistory {
  hcpHistoryId: number;
  userId: number | User;
  hcp: number;
  hcpDate: Date;
}
interface GetHcpHistory extends RowDataPacket, HcpHistory {}

type PostHcpHistory = Omit<HcpHistory, 'hcpHistoryId'>;
type PutHcpHistory = Partial<PostHcpHistory>;

export { HcpHistory, GetHcpHistory, PostHcpHistory, PutHcpHistory };
