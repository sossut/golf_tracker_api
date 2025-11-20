import express from 'express';
import {
  checkToken,
  userDelete,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPut,
  userPutCurrent
} from '../controllers/userController';
import passport from 'passport';
import { body } from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), userListGet)
  .post(
    body('email').isEmail().notEmpty().escape(),
    body('username').isString().notEmpty().escape(),
    body('password').isString().notEmpty().escape(),
    body('hcp').isNumeric().notEmpty().escape(),
    userPost
  )
  .put(passport.authenticate('jwt', { session: false }), userPutCurrent)
  .delete(passport.authenticate('jwt', { session: false }), userDeleteCurrent);

router.get(
  '/token',
  passport.authenticate('jwt', { session: false }),
  checkToken
);

router
  .route('/:id')
  .get(passport.authenticate('jwt', { session: false }), userGet)
  .put(passport.authenticate('jwt', { session: false }), userPut)
  .delete(passport.authenticate('jwt', { session: false }), userDelete);

export default router;
