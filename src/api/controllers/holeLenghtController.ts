import { validationResult } from 'express-validator';
import {
  postHoleLength,
  deleteHoleLength,
  putHoleLength,
  getAllHoleLengths,
  getHoleLength
} from '../models/holeLenghtModel';
import { Request, Response, NextFunction } from 'express';
import { PostHoleLength, PutHoleLength } from '../../interfaces/HoleLength';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';

const holeLengthListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const holeLengths = await getAllHoleLengths();
    res.json(holeLengths);
  } catch (error) {
    next(error);
  }
};

const holeLengthGet = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const holeLength = await getHoleLength(Number(req.params.id));
    res.json(holeLength);
  } catch (error) {
    next(error);
  }
};

const holeLengthPost = async (
  req: Request<{}, {}, PostHoleLength>,
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

    const newHoleLengthId = await postHoleLength(req.body);
    const message: MessageResponse = {
      message: 'hole length created',
      id: newHoleLengthId
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const holeLengthPut = async (
  req: Request<{ id: number }, {}, PutHoleLength>,
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
    const result = await putHoleLength(req.body, Number(req.params.id));
    if (result) {
      const message: MessageResponse = {
        message: 'hole length updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const holeLengthDelete = async (
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
    const result = await deleteHoleLength(Number(req.params.id));
    if (result) {
      const message: MessageResponse = {
        message: 'hole length deleted',
        id: Number(req.params.id)
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};
export {
  holeLengthListGet,
  holeLengthGet,
  holeLengthPost,
  holeLengthPut,
  holeLengthDelete
};
