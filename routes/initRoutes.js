import express from 'express';
import { initializeCache } from '../cacheInitializer.js';

const router = express.Router();

router.get('/init', async (req, res) => {
  initializeCache();
  res.send({ message: 'Initiated successfully. Cache initialization will continue in the background.' });
});

export default router;
