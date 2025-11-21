import {
  getAllUserClubs,
  getUserClub,
  getUserClubsByUserId,
  postUserClub,
  putUserClub,
  deleteUserClub
} from '../models/userClubModel';
import { Request, Response, NextFunction } from 'express';
import { PostUserClub, PutUserClub } from '../../interfaces/UserClub';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';
import { validationResult } from 'express-validator';

const userClubListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userClubs = await getAllUserClubs();
    res.json(userClubs);
  } catch (error) {
    next(error);
  }
};

const userClubGet = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userClub = await getUserClub(Number(req.params.id));
    res.json(userClub);
  } catch (error) {
    next(error);
  }
};

const userClubsByUserIdGet = async (
  req: Request<{ userId: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userClubs = await getUserClubsByUserId(Number(req.params.userId));
    res.json(userClubs);
  } catch (error) {
    next(error);
  }
};

const userClubPost = async (
  req: Request<{}, {}, PostUserClub>,
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
    const result = await postUserClub(req.body);
    if (result) {
      const message: MessageResponse = {
        message: 'user club created',
        id: result
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const userClubPut = async (
  req: Request<{ id: number }, {}, PutUserClub>,
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
    const result = await putUserClub(req.body, req.params.id);
    if (result) {
      const message: MessageResponse = {
        message: 'user club updated',
        id: result.userClubId
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const userClubDelete = async (
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
      throw new CustomError(messages, 400);
    }
    await deleteUserClub(req.params.id);
    const message: MessageResponse = {
      message: 'user club deleted',
      id: req.params.id
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};
export {
  userClubListGet,
  userClubGet,
  userClubsByUserIdGet,
  userClubPost,
  userClubPut,
  userClubDelete
};
