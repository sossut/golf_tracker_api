import { RowDataPacket } from 'mysql2';
import { User } from './User';

interface UserClub {
  userClubId?: number;
  userId: number | User;
  clubId: number;
  fullShots?: number;
  averageDistance?: number;
  leftShots?: number;
  middleShots?: number;
  rightShots?: number;
  shortShots?: number;
  centerShots?: number;
  longShots?: number;
  inBag?: boolean;
}

interface GetUserClub extends RowDataPacket, UserClub {}

type PostUserClub = Omit<UserClub, 'userClubId'>;

type PutUserClub = Partial<PostUserClub>;

export { UserClub, GetUserClub, PostUserClub, PutUserClub };
