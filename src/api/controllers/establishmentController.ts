import { Response, Request, NextFunction } from 'express';
import {
  getAllEstablishments,
  getEstablishment,
  postEstablishment,
  putEstablishment,
  deleteEstablishment,
  getEstablishmentByLocation
} from '../models/establishmentModel';
import {
  PostEstablishment,
  PutEstablishment
} from '../../interfaces/Establishment';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';
import { validationResult } from 'express-validator';

const establishmentListGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const establishments = await getAllEstablishments();

    res.json(establishments);
  } catch (error) {
    next(error);
  }
};

const establishmentGet = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const establishment = await getEstablishment(Number(req.params.id));
    if (!establishment) {
      throw new CustomError('Establishment not found', 404);
    }
    res.json(establishment);
  } catch (error) {
    next(error);
  }
};

const establishmentGetByLocation = async (
  req: Request<{ lng: string; lat: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const establishment = await getEstablishmentByLocation(
      req.params.lng,
      req.params.lat
    );
    if (!establishment) {
      throw new CustomError('Establishment not found', 404);
    }
    res.json(establishment);
  } catch (error) {
    next(error);
  }
};

const establishmentPost = async (
  req: Request<{}, {}, PostEstablishment>,
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
    const result = await postEstablishment(req.body);

    if (result) {
      const message: MessageResponse = {
        message: 'establishment created',
        id: result
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const establishmentPut = async (
  req: Request<{ id: string }, {}, PutEstablishment>,
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
    const establishment = await putEstablishment(
      req.body,
      Number(req.params.id)
    );
    if (establishment) {
      const message: MessageResponse = {
        message: 'establishment updated',
        id: Number(req.params.id)
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const establishmentDelete = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const success = await deleteEstablishment(Number(req.params.id));
    if (success) {
      const message: MessageResponse = {
        message: 'establishment deleted',
        id: Number(req.params.id)
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

export {
  establishmentListGet,
  establishmentGet,
  establishmentGetByLocation,
  establishmentPost,
  establishmentPut,
  establishmentDelete
};
