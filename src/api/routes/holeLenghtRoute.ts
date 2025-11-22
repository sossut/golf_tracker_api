import express from 'express';
import {
  holeLengthDelete,
  holeLengthGet,
  holeLengthListGet,
  holeLengthPost,
  holeLengthPut
} from '../controllers/holeLenghtController';
import passport from 'passport';
import { body, param } from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), holeLengthListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('holeId').isNumeric().notEmpty().escape(),
    body('length').isNumeric().notEmpty().escape(),
    body('par').isNumeric().notEmpty().escape(),
    body('teeId').isNumeric().notEmpty().escape(),
    holeLengthPost
  );
router
  .route('/:id')
  .get(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    holeLengthGet
  )
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('holeId').isNumeric().optional({ nullable: true }).escape(),
    body('length').isNumeric().optional({ nullable: true }).escape(),
    body('par').isNumeric().optional({ nullable: true }).escape(),
    body('teeId').isNumeric().optional({ nullable: true }).escape(),
    holeLengthPut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    holeLengthDelete
  );
export default router;
