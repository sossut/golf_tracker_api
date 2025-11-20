import { RowDataPacket } from 'mysql2';
import { Point } from 'geojson';

interface ClubEstablishment {
  clubEstablishmentId: number;
  clubName: string;
  location: Point;
  abbreviation: string;
  clubNumber: number;
}

interface GetClubEstablishment extends RowDataPacket, ClubEstablishment {}

type PostClubEstablishment = Omit<ClubEstablishment, 'clubEstablishmentId'>;

type PutClubEstablishment = Partial<PostClubEstablishment>;

export {
  ClubEstablishment,
  GetClubEstablishment,
  PostClubEstablishment,
  PutClubEstablishment
};
