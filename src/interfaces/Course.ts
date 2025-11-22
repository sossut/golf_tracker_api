import { RowDataPacket } from 'mysql2';
import { Establishment } from './Establishment';
import { Tee } from './Tee';

interface Course {
  courseId: number;
  courseName: string;
  establishmentId: number | Establishment;
  scorecard?: string;
  par?: number;
  tees: Tee[];
}

interface GetCourse extends RowDataPacket, Course {}

type PostCourse = Omit<Course, 'courseId'>;

type PutCourse = Partial<PostCourse>;

export { Course, GetCourse, PostCourse, PutCourse };
