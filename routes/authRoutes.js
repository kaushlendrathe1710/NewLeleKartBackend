import express from 'express';
import { login, me, register } from '../controllers/authController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', verifyJWT, me);

export default router;
