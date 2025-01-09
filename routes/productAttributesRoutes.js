import express from 'express';
import { 
    getAttributes,
    getAttributeById
} from '../controllers/productAttributesController.js';

const router = express.Router();

router.get('/', getAttributes);
router.get('/:id', getAttributeById);

export default router;
