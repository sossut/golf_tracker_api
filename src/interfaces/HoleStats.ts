import { RowDataPacket } from 'mysql2';
import { Scorecard } from './Scorecard';
import { Hole } from './Hole';

interface HoleStats {
  holeStatsId: number;
  holeId: number | Hole;
  scorecardId: number | Scorecard;
  score: number;
  fairwayHit: boolean;
  greenInRegulation: boolean;
  putts: number;
  penaltyStrokes?: number;
  sandSave: boolean;
  upAndDown: boolean;
}

interface GetHoleStats extends RowDataPacket, HoleStats {}

type PostHoleStats = Omit<HoleStats, 'holeStatsId'>;

type PutHoleStats = Partial<PostHoleStats>;

export { HoleStats, GetHoleStats, PostHoleStats, PutHoleStats };
