import { RowDataPacket } from 'mysql2';
import { Point } from 'geojson';

interface Establishment {
  establishmentId: number;
  establishmentName: string;
  location: Point;
  abbreviation: string;
  establishmentNumber: number;
}

interface GetEstablishment extends RowDataPacket, Establishment {}

type PostEstablishment = Omit<Establishment, 'establishmentId'>;

type PutEstablishment = Partial<PostEstablishment>;

export { Establishment, GetEstablishment, PostEstablishment, PutEstablishment };
