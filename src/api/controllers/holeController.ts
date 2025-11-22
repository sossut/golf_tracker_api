import { validationResult } from 'express-validator';
import {
  getHole,
  getAllHoles,
  postHole,
  putHole,
  deleteHole
} from '../models/holeModel';
import { Request, Response, NextFunction } from 'express';
import { PostHole, PutHole } from '../../interfaces/Hole';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';

const holeListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holes = await getAllHoles();
    res.json(holes);
  } catch (error) {
    next(error);
  }
};

const holeGet = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const hole = await getHole(Number(req.params.id));
    res.json(hole);
  } catch (error) {
    next(error);
  }
};

const holePost = async (
  req: Request<{}, {}, PostHole>,
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
    const newHoleId = await postHole(req.body);
    if (newHoleId) {
      const message: MessageResponse = {
        message: 'hole created',
        id: newHoleId
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const holePut = async (
  req: Request<{ id: string }, {}, PutHole>,
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
    const result = await putHole(req.body, Number(req.params.id));
    if (result) {
      const message: MessageResponse = {
        message: 'hole updated',
        id: Number(req.params.id)
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const holeDelete = async (
  req: Request<{ id: string }, {}, {}>,
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
    const result = await deleteHole(Number(req.params.id));
    if (result) {
      const message: MessageResponse = {
        message: 'hole deleted',
        id: Number(req.params.id)
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

export { holeListGet, holeGet, holePost, holePut, holeDelete };
