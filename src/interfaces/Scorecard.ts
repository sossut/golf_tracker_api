import { RowDataPacket } from 'mysql2';

import { User } from './User';
import { Tee } from './Tee';

interface Scorecard {
  scorecardId: number;
  teeId: number | Tee;
  userId: number | User;
  scorecardDate: Date;
  totalScore: number;
  typeOfRound: 'practice' | 'competition';
  createdAt: Date;
}

interface GetScorecard extends RowDataPacket, Scorecard {}

type PostScorecard = Omit<Scorecard, 'scorecardId'>;

type PutScorecard = Partial<PostScorecard>;

export { Scorecard, GetScorecard, PostScorecard, PutScorecard };
