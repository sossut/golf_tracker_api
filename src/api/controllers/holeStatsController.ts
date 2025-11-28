import { validationResult } from 'express-validator';
import {
  postHoleStats,
  deleteHoleStats,
  putHoleStats,
  getAllHoleStats,
  getHoleStats
} from '../models/holeStatsModel';
import { Request, Response, NextFunction } from 'express';
import { PostHoleStats, PutHoleStats } from '../../interfaces/HoleStats';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';
import { postShot } from '../models/shotModel';

const holeStatsListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const holeStats = await getAllHoleStats();
    res.json(holeStats);
  } catch (error) {
    next(error);
  }
};

const holeStatsGet = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const holeStats = await getHoleStats(req.params.id);
    res.json(holeStats);
  } catch (error) {
    next(error);
  }
};

const holeStatsPost = async (
  req: Request<{}, {}, PostHoleStats>,
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
    const holeStatsId = await postHoleStats(req.body);
    if (holeStatsId) {
      const shots = req.body.shots || [];
      for (const shot of shots) {
        const newShot = {
          ...shot,
          holeStatsId: holeStatsId,
          createdAt: new Date()
        };
        const newShotId = await postShot(newShot);
        console.log(`New shot ID: ${newShotId}`);
      }

      const message: MessageResponse = {
        message: 'hole stats created',
        id: holeStatsId
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const holeStatsPut = async (
  req: Request<{ id: number }, {}, PutHoleStats>,
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
    const affectedRows = await putHoleStats(req.body, req.params.id);
    if (affectedRows) {
      const message: MessageResponse = {
        message: 'hole stats updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const holeStatsDelete = async (
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
    const affectedRows = await deleteHoleStats(req.params.id);
    if (affectedRows) {
      const message: MessageResponse = {
        message: 'hole stats deleted',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

export {
  holeStatsListGet,
  holeStatsGet,
  holeStatsPost,
  holeStatsPut,
  holeStatsDelete
};
