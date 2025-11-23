import { validationResult } from 'express-validator';
import {
  postScorecard,
  deleteScorecard,
  putScorecard,
  getAllScorecards,
  getScorecard
} from '../models/scorecardModel';
import { Request, Response, NextFunction } from 'express';
import {
  PostScorecard,
  PutScorecard,
  Scorecard
} from '../../interfaces/Scorecard';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';
import { postHoleStats } from '../models/holeStatsModel';
import { postShot } from '../models/shotModel';
import { User } from '../../interfaces/User';
import { toCamel } from '../../utils/utilities';

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
    const user = toCamel(req.user as any) as User;
    const newScorecard: Scorecard = {
      userId: user.userId,
      teeId: req.body.teeId,
      scorecardDate: req.body.scorecardDate,
      typeOfRound: req.body.typeOfRound
    };

    const newScorecardId = await postScorecard(newScorecard);
    console.log('new scorecard id', newScorecardId);
    const holeStats = req.body.holeStats || [];
    if (newScorecardId) {
      for (const holeStat of holeStats) {
        console.log(holeStat);
        const newHoleStat = {
          ...holeStat,
          scorecardId: newScorecardId,
          createdAt: new Date()
        };
        const newHoleStatsId = await postHoleStats(newHoleStat);
        console.log(`New hole stats ID: ${newHoleStatsId}`);
        if (newHoleStatsId) {
          const shots = holeStat.shots || [];
          for (const shot of shots) {
            const newShot = {
              ...shot,
              holeStatsId: newHoleStatsId,
              createdAt: new Date()
            };
            const newShotId = await postShot(newShot);
            console.log(`New shot ID: ${newShotId}`);
          }
        }
      }
      const message: MessageResponse = {
        message: 'Scorecard created',
        id: newScorecardId
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
