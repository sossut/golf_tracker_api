import { RowDataPacket } from 'mysql2';
// Maila
interface Club {
  clubId: number;
  clubName: string;
}

interface GetClub extends RowDataPacket, Club {}

type PostClub = Omit<Club, 'clubId'>;

type PutClub = Partial<PostClub>;

export { Club, GetClub, PostClub, PutClub };
