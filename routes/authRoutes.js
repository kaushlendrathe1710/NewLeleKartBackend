import express from 'express';
import { login, me, register, forgotPassword, deleteAccount } from '../controllers/authController.js';
import verifyJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.get('/me', verifyJWT, me);
router.delete('/account', verifyJWT, deleteAccount);

export default router;
