import express from 'express';
import {
  teeDelete,
  teeGet,
  teeGetByCourseId,
  teeListGet,
  teePost,
  teePut
} from '../controllers/teeController';
import passport from 'passport';
import { body, param } from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), teeListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('teeName').isString().notEmpty().escape(),
    body('courseId').isNumeric().notEmpty().escape(),
    body('length').isNumeric().notEmpty().escape(),
    body('slopeRating').isNumeric().notEmpty().escape(),
    body('courseRating').isNumeric().notEmpty().escape(),
    teePost
  );
router
  .route('/:id')
  .get(passport.authenticate('jwt', { session: false }), teeGet)
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('teeName').isString().optional({ nullable: true }).escape(),
    body('courseId').isNumeric().optional({ nullable: true }).escape(),
    body('length').isNumeric().optional({ nullable: true }).escape(),
    body('slopeRating').isNumeric().optional({ nullable: true }).escape(),
    body('courseRating').isNumeric().optional({ nullable: true }).escape(),
    teePut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    teeDelete
  );
router.get(
  '/course/:courseId',
  passport.authenticate('jwt', { session: false }),
  param('courseId').isNumeric().notEmpty().escape(),
  teeGetByCourseId
);
export default router;
