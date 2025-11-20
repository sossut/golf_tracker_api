import { RowDataPacket } from 'mysql2';
import { Course } from './Course';
import { User } from './User';

interface Scorecard {
  scorecardId: number;
  courseId: number | Course;
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
