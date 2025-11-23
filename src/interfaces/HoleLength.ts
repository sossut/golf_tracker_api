import { Point } from 'geojson';
import { RowDataPacket } from 'mysql2';
import { Tee } from './Tee';
import { Hole } from './Hole';

interface HoleLength {
  holeLengthId?: number;
  holeId: number | Hole;
  teeId: number | Tee;
  length: number;
  teeBoxLocation: Point;
  par: number;
}

interface GetHoleLength extends RowDataPacket, HoleLength {}

type PostHoleLength = Omit<HoleLength, 'holeLengthId'>;

type PutHoleLength = Partial<PostHoleLength>;

export { HoleLength, GetHoleLength, PostHoleLength, PutHoleLength };
