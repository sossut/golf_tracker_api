import { RowDataPacket } from 'mysql2';

import { UserClub } from './UserClub';

interface User {
  userId: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'admin' | 'user';
  hcp: number;
  clubs?: UserClub[];
}

interface GetUser extends RowDataPacket, User {}

type PostUser = Omit<User, 'userId'>;

type PutUser = Partial<PostUser>;

export { User, GetUser, PostUser, PutUser };
