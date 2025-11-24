import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
// import emojis from './emojis';
import userRoute from './routes/userRoute';
import authRoute from './routes/authRoute';
import clubRoute from './routes/clubRoute';
import establishmentRoute from './routes/establishmentRoute';
import courseRoute from './routes/courseRoute';
import holeRoute from './routes/holeRoute';
import teeRoute from './routes/teeRoute';
import holeLenghtRoute from './routes/holeLenghtRoute';
import holeStatsRoute from './routes/holeStatsRoute';
import scorecardRoute from './routes/scorecardRoute';
import typeOfShotRoute from './routes/typeOfShotRoute';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

// router.use('/emojis', emojis);

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/club', clubRoute);
router.use('/establishment', establishmentRoute);
router.use('/course', courseRoute);
router.use('/hole', holeRoute);
router.use('/tee', teeRoute);
router.use('/hole-length', holeLenghtRoute);
router.use('/hole-stats', holeStatsRoute);
router.use('/scorecard', scorecardRoute);
router.use('/type-of-shot', typeOfShotRoute);

export default router;
