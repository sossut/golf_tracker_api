import { validationResult } from 'express-validator';
import {
  postTypeOfShot,
  deleteTypeOfShot,
  putTypeOfShot,
  getAllTypeOfShots,
  getTypeOfShot
} from '../models/typeOfShotModel';
import { Request, Response, NextFunction } from 'express';
import { PostTypeOfShot, PutTypeOfShot } from '../../interfaces/TypeOfShot';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';

const typeOfShotListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const typeOfShots = await getAllTypeOfShots();
    res.json(typeOfShots);
  } catch (error) {
    next(error);
  }
};
const typeOfShotGet = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const typeOfShot = await getTypeOfShot(req.params.id);
    res.json(typeOfShot);
  } catch (error) {
    next(error);
  }
};

const typeOfShotPost = async (
  req: Request<{}, {}, PostTypeOfShot>,
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
    const insertId = await postTypeOfShot(req.body);
    if (insertId) {
      const message: MessageResponse = {
        message: 'Type of shot created',
        id: insertId
      };
      res.status(201).json(message);
    }
  } catch (error) {
    next(error);
  }
};

const typeOfShotPut = async (
  req: Request<{ id: number }, {}, PutTypeOfShot>,
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
    const affectedRows = await putTypeOfShot(req.body, req.params.id);
    if (affectedRows) {
      const message: MessageResponse = {
        message: 'Type of shot updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const typeOfShotDelete = async (
  req: Request<{ id: number }, {}, {}>,
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
    const affectedRows = await deleteTypeOfShot(req.params.id);
    if (affectedRows) {
      const message: MessageResponse = {
        message: 'Type of shot deleted',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

export {
  typeOfShotListGet,
  typeOfShotGet,
  typeOfShotPost,
  typeOfShotPut,
  typeOfShotDelete
};
