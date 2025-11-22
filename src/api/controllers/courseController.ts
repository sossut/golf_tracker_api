import { validationResult } from 'express-validator';
import {
  getCourse,
  getAllCourses,
  postCourse,
  putCourse,
  deleteCourse
} from '../models/courseModel';
import { Request, Response, NextFunction } from 'express';
import { PostCourse, PutCourse } from '../../interfaces/Course';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';

const courseListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (error) {
    next(error);
  }
};
const courseGet = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const course = await getCourse(Number(req.params.id));
    if (!course) {
      throw new CustomError('Course not found', 404);
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
};

const coursePost = async (
  req: Request<{}, {}, PostCourse>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => {
          if (error.type === 'field') {
            return `${error.msg}: ${error.path}`;
          }
        })
        .join(', ');
      throw new CustomError(`Validation failed: ${messages}`, 400);
    }
    const newCourse = await postCourse(req.body);
    if (newCourse) {
      const message: MessageResponse = {
        message: 'course created',
        id: newCourse
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const coursePut = async (
  req: Request<{ id: number }, {}, PutCourse>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => {
          if (error.type === 'field') {
            return `${error.msg}: ${error.path}`;
          }
        })
        .join(', ');
      throw new CustomError(messages, 400);
    }
    const updatedCourse = await putCourse(req.body, req.params.id);
    if (updatedCourse) {
      const message: MessageResponse = {
        message: 'course updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const courseDelete = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const success = await deleteCourse(req.params.id);
    if (success) {
      const message: MessageResponse = {
        message: 'course deleted',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

export { courseListGet, courseGet, coursePost, coursePut, courseDelete };
