import express from 'express';
import {
  typeOfShotDelete,
  typeOfShotGet,
  typeOfShotListGet,
  typeOfShotPost,
  typeOfShotPut
} from '../controllers/typeOfShotController';
import { body, param } from 'express-validator';
import passport from 'passport';
const router = express.Router();

router
  .route('/')
  .get(passport.authenticate('jwt', { session: false }), typeOfShotListGet)
  .post(
    passport.authenticate('jwt', { session: false }),
    body('typeOfShot').isString().isLength({ max: 100 }).notEmpty().escape(),
    typeOfShotPost
  );
router
  .route('/:id')
  .get(
    passport.authenticate('jwt', { session: false }),
    param('id').isInt({ gt: 0 }),
    typeOfShotGet
  )
  .put(
    passport.authenticate('jwt', { session: false }),
    param('id').isNumeric().notEmpty().escape(),
    body('typeOfShot').isString().isLength({ max: 100 }).optional().escape(),
    typeOfShotPut
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    param('id').isInt({ gt: 0 }),
    typeOfShotDelete
  );
export default router;
