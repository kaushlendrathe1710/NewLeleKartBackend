import express from 'express';
import { getCategories, getCategoryById, getSubcategories, getCategoryFilters } from '../controllers/categoriesController.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.get('/:parentId/subcategories', getSubcategories);
router.get('/:id/filters', getCategoryFilters);

export default router;
