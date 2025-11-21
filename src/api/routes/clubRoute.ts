import express from 'express';
import {
  clubDelete,
  clubGet,
  clubListGet,
  clubPost,
  clubPut
} from '../controllers/clubController';

import passport from 'passport';
import { body, param } from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), clubListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('clubName').isString().notEmpty().escape(),
    clubPost
  );
router
  .route('/:id')
  .get(passport.authenticate('jwt', { session: false }), clubGet)
  .put(
    passport.authenticate('jwt', { session: false }),
    param('clubId').isNumeric().notEmpty().escape(),
    body('clubName').isString().escape(),
    clubPut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('clubId').isNumeric().notEmpty().escape(),
    clubDelete
  );
export default router;
