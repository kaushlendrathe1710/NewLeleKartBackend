import express from 'express';
import {
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
} from '../controllers/bannerController.js';

const router = express.Router();

router.get('/:id', getBanner);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);
router.get('/', getAllBanners);

export default router;
