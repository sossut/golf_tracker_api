import { RowDataPacket } from 'mysql2';
import { ClubEstablishment } from './ClubEstablishment';
import { Tee } from './Tee';

interface Course {
  courseId: number;
  courseName: string;
  clubId: number | ClubEstablishment;
  scorecard?: string;
  par: number;
  tees: Tee[];
}

interface GetCourse extends RowDataPacket, Course {}

type PostCourse = Omit<Course, 'courseId'>;

type PutCourse = Partial<PostCourse>;

export { Course, GetCourse, PostCourse, PutCourse };
