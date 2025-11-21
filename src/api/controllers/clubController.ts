import { Request, Response, NextFunction } from 'express';
import {
  getAllClubs,
  getClub,
  postClub,
  putClub,
  deleteClub
} from '../models/clubModel';
import { PostClub, PutClub } from '../../interfaces/Club';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';
import { validationResult } from 'express-validator';
const clubListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clubs = await getAllClubs();
    res.json(clubs);
  } catch (error) {
    next(error);
  }
};

const clubGet = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const club = await getClub(Number(req.params.id));
    res.json(club);
  } catch (error) {
    next(error);
  }
};

const clubPost = async (
  req: Request<{}, {}, PostClub>,
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
    const result = await postClub(req.body);
    if (result) {
      const message: MessageResponse = {
        message: 'club created',
        id: result
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const clubPut = async (
  req: Request<{ id: number }, {}, PutClub>,
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
    const updatedClub = await putClub(req.body, Number(req.params.id));
    res.json(updatedClub);
  } catch (error) {
    next(error);
  }
};

const clubDelete = async (
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
    const result = await deleteClub(Number(req.params.id));
    if (result) {
      const message: MessageResponse = {
        message: 'club deleted',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};
export { clubListGet, clubGet, clubPost, clubPut, clubDelete };
