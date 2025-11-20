import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
// import emojis from './emojis';
import userRoute from './routes/userRoute';
import authRoute from './routes/authRoute';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

// router.use('/emojis', emojis);

router.use('/auth', authRoute);
router.use('/user', userRoute);

export default router;
