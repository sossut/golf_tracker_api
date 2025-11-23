import { validationResult } from 'express-validator';
import {
  postScorecard,
  deleteScorecard,
  putScorecard,
  getAllScorecards,
  getScorecard
} from '../models/scorecardModel';
import { Request, Response, NextFunction } from 'express';
import { PostScorecard, PutScorecard } from '../../interfaces/Scorecard';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';

const scorecardListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const scorecards = await getAllScorecards();
    res.json(scorecards);
  } catch (error) {
    next(error);
  }
};

const scorecardGet = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const scorecard = await getScorecard(req.params.id);
    res.json(scorecard);
  } catch (error) {
    next(error);
  }
};

const scorecardPost = async (
  req: Request<{}, {}, PostScorecard>,
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
    const insertId = await postScorecard(req.body);
    if (insertId) {
      const message: MessageResponse = {
        message: 'Scorecard created',
        id: insertId
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const scorecardPut = async (
  req: Request<{ id: number }, {}, PutScorecard>,
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
    const insertId = await putScorecard(req.body, req.params.id);
    if (insertId) {
      const message: MessageResponse = {
        message: 'Scorecard updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const scorecardDelete = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const messages = error
        .array()
        .map((err) => {
          if (err.type === 'field') {
            return `${err.msg}: ${err.path}`;
          }
        })
        .join(', ');
      throw new CustomError(`Validation failed: ${messages}`, 400);
    }
    const insertId = await deleteScorecard(req.params.id);
    if (insertId) {
      const message: MessageResponse = {
        message: 'Scorecard deleted',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

export {
  scorecardListGet,
  scorecardGet,
  scorecardPost,
  scorecardPut,
  scorecardDelete
};
