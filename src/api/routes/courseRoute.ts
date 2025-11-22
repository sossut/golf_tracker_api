import express from 'express';
import {
  courseDelete,
  courseGet,
  courseListGet,
  coursePost,
  coursePut
} from '../controllers/courseController';
import passport from 'passport';
import { body, param } from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), courseListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('courseName').isString().notEmpty().escape(),
    body('establishmentId').isNumeric().notEmpty().escape(),
    body('scorecard').isString().optional({ nullable: true }).escape(),
    coursePost
  );
router
  .route('/:id')
  .get(passport.authenticate('jwt', { session: false }), courseGet)
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('courseName').isString().escape(),
    body('establishmentId').isNumeric().optional({ nullable: true }).escape(),
    body('scorecard').isString().optional({ nullable: true }).escape(),
    coursePut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    courseDelete
  );
export default router;
