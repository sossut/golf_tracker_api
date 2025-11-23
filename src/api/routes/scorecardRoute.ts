import express from 'express';
import {
  scorecardListGet,
  scorecardGet,
  scorecardPost,
  scorecardPut,
  scorecardDelete
} from '../controllers/scorecardController';
import { body, param } from 'express-validator';
import passport from 'passport';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), scorecardListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('userId').isNumeric().notEmpty().escape(),
    body('teeId').isNumeric().notEmpty().escape(),
    body('scorecardDate').isISO8601().toDate().notEmpty().escape(),
    body('typeOfRound').isString().isLength({ max: 50 }).optional().escape(),
    scorecardPost
  );
router
  .route('/:id')
  .get(
    passport.authenticate('jwt', { session: false }),
    param('id').isInt({ gt: 0 }),
    scorecardGet
  )
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('userId').isNumeric().optional({ nullable: true }).escape(),
    body('teeId').isNumeric().optional({ nullable: true }).escape(),
    body('scorecardDate')
      .isISO8601()
      .toDate()
      .optional({ nullable: true })
      .escape(),
    body('typeOfRound').isString().isLength({ max: 50 }).optional().escape(),
    scorecardPut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isInt({ gt: 0 }),
    scorecardDelete
  );
export default router;
