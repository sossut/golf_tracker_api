import express from 'express';
import {
  holeDelete,
  holeGet,
  holeListGet,
  holePost,
  holePut
} from '../controllers/holeController';

import passport from 'passport';
import { body, param } from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), holeListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('courseId').isNumeric().notEmpty().escape(),
    body('holeNumber').isNumeric().notEmpty().escape(),
    body('slopeIndex').isNumeric().notEmpty().escape(),
    holePost
  );
router
  .route('/:id')
  .get(passport.authenticate('jwt', { session: false }), holeGet)
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('courseId').isNumeric().optional({ nullable: true }).escape(),
    body('holeNumber').isNumeric().optional({ nullable: true }).escape(),
    body('slopeIndex').isNumeric().optional({ nullable: true }).escape(),
    holePut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    holeDelete
  );
export default router;
