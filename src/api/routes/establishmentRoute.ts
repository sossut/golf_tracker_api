import express from 'express';
import {
  establishmentDelete,
  establishmentGet,
  establishmentListGet,
  establishmentPost,
  establishmentPut
} from '../controllers/establishmentController';
import passport from 'passport';
import { body, param } from 'express-validator';
const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), establishmentListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('establishmentName').isString().notEmpty().escape(),
    body('abbreviation').isString().notEmpty().escape(),
    body('location').isObject().notEmpty(),
    body('establishmentNumber').isNumeric().notEmpty().escape(),
    establishmentPost
  );
router
  .route('/:id')
  .get(passport.authenticate('jwt', { session: false }), establishmentGet)
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('establishmentName').isString().escape(),
    body('abbreviation').isString().escape(),
    body('establishmentNumber').isNumeric().escape(),
    body('location').isObject().notEmpty(),
    establishmentPut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    establishmentDelete
  );
export default router;
