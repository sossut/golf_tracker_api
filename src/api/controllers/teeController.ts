import { validationResult } from 'express-validator';
import {
  getTee,
  getAllTees,
  postTee,
  putTee,
  deleteTee,
  getTeesByCourseId
} from '../models/teeModel';
import { Request, Response, NextFunction } from 'express';
import { PostTee, PutTee } from '../../interfaces/Tee';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';
import { toCamel } from '../../utils/utilities';

const teeListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tees = await getAllTees();
    const camelCaseTees = tees.map((tee) => toCamel(tee));
    camelCaseTees.forEach((tee) => {
      if (tee.slopeRating) {
        tee.slopeRating /= 10;
      }
    });
    res.json(camelCaseTees);
  } catch (error) {
    next(error);
  }
};

const teeGet = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const tee = await getTee(Number(req.params.id));
    const camelCase = toCamel(tee);
    if (camelCase.slopeRating) {
      camelCase.slopeRating /= 10;
    }
    console.log(camelCase.slopeRating);
    if (!tee) {
      throw new CustomError('Tee not found', 404);
    }
    res.json(camelCase);
  } catch (error) {
    next(error);
  }
};

const teeGetByCourseId = async (
  req: Request<{ courseId: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const tees = await getTeesByCourseId(Number(req.params.courseId));
    res.json(tees);
  } catch (error) {
    next(error);
  }
};

const teePost = async (
  req: Request<{}, {}, PostTee>,
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
    req.body.slopeRating *= 10;
    const insertId = await postTee(req.body);
    if (insertId) {
      const message: MessageResponse = {
        message: 'tee created',
        id: insertId
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const teePut = async (
  req: Request<{ id: number }, {}, PutTee>,
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
    if (req.body.slopeRating) {
      req.body.slopeRating *= 10;
    }
    const affectedRows = await putTee(Number(req.params.id), req.body);
    if (affectedRows) {
      const message: MessageResponse = {
        message: 'tee updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const teeDelete = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const affectedRows = await deleteTee(Number(req.params.id));
    if (affectedRows) {
      const message: MessageResponse = {
        message: 'tee deleted',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};
export { teeListGet, teeGet, teePost, teePut, teeDelete, teeGetByCourseId };
