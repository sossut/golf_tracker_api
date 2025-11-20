import { RowDataPacket } from 'mysql2';
import { Course } from './Course';

interface Tee {
  teeId: number;
  teeName: string;
  courseId: number | Course;
  length: number;
  slope: number;
  rating: number;
}

interface GetTee extends RowDataPacket, Tee {}

type PostTee = Omit<Tee, 'teeId'>;

type PutTee = Partial<PostTee>;

export { Tee, GetTee, PostTee, PutTee };
