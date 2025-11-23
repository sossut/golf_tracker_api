import express from 'express';
import {
  holeStatsDelete,
  holeStatsGet,
  holeStatsListGet,
  holeStatsPost,
  holeStatsPut
} from '../controllers/holeStatsController';
import { body, param } from 'express-validator';
import passport from 'passport';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), holeStatsListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('holeId').isNumeric().notEmpty().escape(),
    body('scorecardId').isNumeric().notEmpty().escape(),
    body('score').isNumeric().notEmpty().escape(),
    body('fairwayHit').isBoolean().notEmpty().escape(),
    body('greenInRegulation').isBoolean().notEmpty().escape(),
    body('putts').isNumeric().notEmpty().escape(),
    body('penaltyStrokes').isNumeric().optional({ nullable: true }).escape(),
    body('sandSave').isBoolean().optional({ nullable: true }).escape(),
    body('upAndDown').isBoolean().optional({ nullable: true }).escape(),
    holeStatsPost
  );
router
  .route('/:id')
  .get(
    passport.authenticate('jwt', { session: false }),
    param('id').isInt({ gt: 0 }),
    holeStatsGet
  )
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('holeId').isNumeric().optional({ nullable: true }).escape(),
    body('scorecardId').isNumeric().optional({ nullable: true }).escape(),
    body('score').isNumeric().optional({ nullable: true }).escape(),
    body('fairwayHit').isBoolean().optional({ nullable: true }).escape(),
    body('greenInRegulation').isBoolean().optional({ nullable: true }).escape(),
    body('putts').isNumeric().optional({ nullable: true }).escape(),
    body('penaltyStrokes').isNumeric().optional({ nullable: true }).escape(),
    body('sandSave').isBoolean().optional({ nullable: true }).escape(),
    body('upAndDown').isBoolean().optional({ nullable: true }).escape(),
    holeStatsPut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    holeStatsDelete
  );
export default router;
