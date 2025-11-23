import { RowDataPacket } from 'mysql2';
import { HoleStats } from './HoleStats';
import { Club } from './Club';
import { TypeOfShot } from './TypeOfShot';
import { Point } from 'geojson';

interface Shot {
  shotId: number;
  holeStatsId: number | HoleStats;
  clubId: number | Club;
  leftMiddleRight: 'left' | 'middle' | 'right';
  shortCenterLong: 'short' | 'center' | 'long';
  typeOfShotId: number | TypeOfShot;
  locationStart: Point;
  locationEnd: Point;
  inHole: boolean;
  shotNumber: number;
}

interface GetShot extends RowDataPacket, Shot {}

type PostShot = Omit<Shot, 'shotId'>;

type PutShot = Partial<PostShot>;

export { Shot, GetShot, PostShot, PutShot };
