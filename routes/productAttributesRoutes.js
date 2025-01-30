import express from 'express';
import { 
    getAttributes,
    getAttributeById,
    getAllAttributesWithTerms
} from '../controllers/productAttributesController.js';

const router = express.Router();

router.get('/', getAttributes);
router.get('/all-with-terms', getAllAttributesWithTerms);
router.get('/:id', getAttributeById);

export default router;
