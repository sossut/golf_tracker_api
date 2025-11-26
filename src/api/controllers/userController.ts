import { validationResult } from 'express-validator';
import {
  postUser,
  deleteUser,
  putUser,
  getAllUsers,
  getUser
} from '../models/userModel';
import { Request, Response, NextFunction } from 'express';

import bcrypt from 'bcryptjs';
import { User, PostUser } from '../../interfaces/User';
import CustomError from '../../classes/CustomError';
import MessageResponse from '../../interfaces/MessageResponse';
import { UserClub } from '../../interfaces/UserClub';
import {
  checkIfUserHasClub,
  getUserClubByUserIdAndClubId,
  postUserClub,
  putUserClub
} from '../models/userClubModel';
import { toCamel } from '../../utils/utilities';
import { postHcpHistory } from '../models/hcpHistoryModel';

const salt = bcrypt.genSaltSync(12);

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    const camelCaseUsers = users.map((user) => toCamel(user));
    camelCaseUsers.forEach((user) => {
      if (user.hcp) {
        user.hcp /= 10;
        // if (user.hcp < 0) {
        //   user.hcp = '+' + Math.abs(user.hcp);
        // }
      }
    });
    res.json(camelCaseUsers);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{ id: number }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getUser(req.params.id as number);
    const camelCaseUser = toCamel(user);
    if (camelCaseUser.hcp) {
      camelCaseUser.hcp /= 10;
    }
    res.json(camelCaseUser);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, PostUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
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
    const { password } = req.body;
    if (!req.body.hcp) {
      req.body.hcp = 540;
    } else {
      req.body.hcp = Number(req.body.hcp) * 10;
    }

    req.body.password = bcrypt.hashSync(password, salt);
    console.log('userPost req.body', req.body);
    const result = await postUser(req.body);
    const hcpHistoryData = {
      userId: Number(result),
      hcp: req.body.hcp,
      hcpDate: new Date(new Date().toISOString().split('T')[0])
    };
    console.log({ hcpHistoryData });
    await postHcpHistory(hcpHistoryData);
    if (result) {
      res.json({
        message: 'user added',
        user_id: result
      });
    }
  } catch (error) {
    next(error);
  }
};

const userPut = async (
  req: Request<{ id: number }, {}, User>,
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
    const u = toCamel(req.user as User);
    if (u.role === 'admin' || u.userId == req.params.id) {
      const user = req.body;
      const clubs = user.clubs;
      if (clubs && clubs.length > 0) {
        for (const club of clubs) {
          console.log({ club });

          try {
            const check = await checkIfUserHasClub(req.params.id, club.clubId);
            if (!check) {
              const userClub: UserClub = {
                userId: req.params.id,
                clubId: club.clubId,
                inBag: club.inBag
              };
              console.log({ userClub });
              await postUserClub(userClub);
            } else {
              const userClub = await getUserClubByUserIdAndClubId(
                req.params.id,
                club.clubId
              );
              console.log({ userClub });
              const userClubCamel = toCamel(userClub);
              await putUserClub(club, userClubCamel.userClubId as number);
            }
          } catch (error) {
            throw new CustomError('Error processing user clubs', 500);
          }
        }
      }
    } else {
      throw new CustomError('Unauthorized', 403);
    }

    const user = req.body;
    const clubs = user.clubs;
    if (clubs && clubs.length > 0) {
      for (const club of clubs) {
        console.log({ club });

        try {
          const check = await checkIfUserHasClub(req.params.id, club.clubId);
          if (!check) {
            const userClub: UserClub = {
              userId: req.params.id,
              clubId: club.clubId,
              inBag: club.inBag
            };
            console.log({ userClub });
            await postUserClub(userClub);
          } else {
            const userClub = await getUserClubByUserIdAndClubId(
              req.params.id,
              club.clubId
            );
            console.log({ userClub });
            const userClubCamel = toCamel(userClub);
            await putUserClub(club, userClubCamel.userClubId as number);
          }
        } catch (error) {
          throw new CustomError('Error processing user clubs', 500);
        }
      }
    }

    delete user.clubs;

    const result = await putUser(user, req.params.id);
    if (req.body.hcp) {
      // Add new HCP history entry
      const hcpHistoryData = {
        userId: req.params.id,
        hcp: req.body.hcp,
        hcpDate: new Date(new Date().toISOString().split('T')[0])
      };
      await postHcpHistory(hcpHistoryData);
    }
    if (result) {
      const message: MessageResponse = {
        message: 'user updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request<{ id: number }, {}, User>,
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
    const user = req.body;
    const clubs = user.clubs;
    if (clubs && clubs.length > 0) {
      for (const club of clubs) {
        console.log({ club });

        try {
          const check = await checkIfUserHasClub(req.params.id, club.clubId);
          if (!check) {
            const userClub: UserClub = {
              userId: req.params.id,
              clubId: club.clubId,
              inBag: club.inBag
            };
            console.log({ userClub });
            await postUserClub(userClub);
          } else {
            const userClub = await getUserClubByUserIdAndClubId(
              req.params.id,
              club.clubId
            );
            console.log({ userClub });
            const userClubCamel = toCamel(userClub);
            await putUserClub(club, userClubCamel.userClubId as number);
          }
        } catch (error) {
          throw new CustomError('Error processing user clubs', 500);
        }
      }
    }

    delete user.clubs;
    console.log(user);

    const result = await putUser(user, req.params.id);
    if (result) {
      const message: MessageResponse = {
        message: 'user updated',
        id: req.params.id
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const userDelete = async (
  req: Request<{ id: number }, {}, { user: User }>,
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
    if ((req.user as User).role === 'admin') {
      const result = await deleteUser(req.params.id);
      if (result) {
        const message: MessageResponse = {
          message: 'user deleted',
          id: req.params.id
        };
        res.json(message);
      }
    }
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteUser((req.user as User).userId);
    if (result) {
      const message: MessageResponse = {
        message: 'user deleted',
        id: (req.user as User).userId
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    res.json(req.user);
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutCurrent,
  userDelete,
  userDeleteCurrent,
  checkToken
};
