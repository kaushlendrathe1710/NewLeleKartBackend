import express from 'express';
import { getCategories, getCategoryById, getSubcategories } from '../controllers/categoriesController.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.get('/:parentId/subcategories', getSubcategories);

export default router;
