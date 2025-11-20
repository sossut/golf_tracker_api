import { RowDataPacket } from 'mysql2';
import { Course } from './Course';
import { HoleLength } from './HoleLenght';
import { Point } from 'geojson';

interface Hole {
  holeId: number;
  holeNumber: number;
  par: number;
  courseId: number | Course;
  greenCenterLocation?: Point;
  slopeIndex: number;
  lengths: HoleLength[];
}

interface GetHole extends RowDataPacket, Hole {}

type PostHole = Omit<Hole, 'holeId'>;

type PutHole = Partial<PostHole>;

export { Hole, GetHole, PostHole, PutHole };
