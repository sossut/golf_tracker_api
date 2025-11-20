import { Point } from 'geojson';
import { RowDataPacket } from 'mysql2';

interface HoleLength {
  holeLengthId: number;
  holeId: number;
  teeId: number;
  length: number;
  teeBoxLocation: Point;
}

interface GetHoleLength extends RowDataPacket, HoleLength {}

type PostHoleLength = Omit<HoleLength, 'holeLengthId'>;

type PutHoleLength = Partial<PostHoleLength>;

export { HoleLength, GetHoleLength, PostHoleLength, PutHoleLength };
