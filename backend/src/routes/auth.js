import { Router} from 'express';
import { register, login, getMe, refreshAccessToken } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = Router();

// Register a new user
router.route('/register').post( register);

// Login user
router.route('/login').post(login);

// Get current user
router.route("/me").get(verifyJWT, getMe);

router.route("/refresh-token").post(refreshAccessToken)

export default router;