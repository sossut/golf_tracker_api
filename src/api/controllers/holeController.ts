import { validationResult } from 'express-validator';
import {
  getHole,
  getAllHoles,
  postHole,
  putHole,
  deleteHole,
  checkIfHoleExists,
  getHoleIdByCourseAndNumber
} from '../models/holeModel';
import { Request, Response, NextFunction } from 'express';
import { PostHole, PutHole } from '../../interfaces/Hole';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';

import { postHoleLength } from '../models/holeLengthModel';
import { HoleLength } from '../../interfaces/HoleLength';

const holeListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holes = await getAllHoles();
    res.json(holes);
  } catch (error) {
    next(error);
  }
};

const holeGet = async (
  req: Request<{ id: number }, {}, {}>,
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
    const holeCheck = await checkIfHoleExists(
      req.body.courseId as number,
      req.body.holeNumber as number
    );
    if (holeCheck) {
      throw new CustomError('Hole already exists', 409);
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

const holePostMulti = async (
  req: Request<{}, {}, PostHole[]>,
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
    const dummy = req.body as unknown as any;
    const holes = dummy.holes as unknown as any[];
    const courseId = dummy.course.courseId as number;
    let insertIds = 0;
    for (const hole of holes) {
      console.log(courseId, hole.holeNumber);

      let newHole = await getHoleIdByCourseAndNumber(
        courseId,
        hole.holeNumber as number
      );
      if (!newHole) {
        hole.courseId = courseId;
        newHole = await postHole(hole);
      }
      const newHoleLength: HoleLength = {
        teeId: hole.holeLength.teeId,
        holeId: newHole,
        length: hole.holeLength.length,
        teeBoxLocation: hole.holeLength.teeBoxLocation,
        par: hole.holeLength.par
      };
      const newHoleLengthId = await postHoleLength(newHoleLength);
      if (!newHoleLengthId) {
        throw new CustomError(
          `Failed to create hole length for hole ${hole.holeNumber}`,
          500
        );
      }
      insertIds++;
    }

    const message: MessageResponse = {
      message: insertIds + ' Holes created',
      id: 0
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const holePut = async (
  req: Request<{ id: number }, {}, PutHole>,
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
    if (req.body.courseId || req.body.holeNumber) {
      const holeCheck = await checkIfHoleExists(
        req.body.courseId as number,
        req.body.holeNumber as number
      );
      if (holeCheck) {
        throw new CustomError('Hole already exists', 409);
      }
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

export { holeListGet, holeGet, holePost, holePostMulti, holePut, holeDelete };
