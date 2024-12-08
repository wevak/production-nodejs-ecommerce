import express from "express";
import {
  getUserProfileController,
  loginController,
  passwordResetController,
  passwordUpdateController,
  profilePicUpdateController,
  registerController,
  userLogoutController,
  userProfileUpdateController,
} from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";
import { rateLimit } from "express-rate-limit";

//rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

const router = express.Router();

//routes
//register
router.post("/register", limiter, registerController);

//login
router.post("/login", limiter, loginController);

//profile
router.get("/profile", isAuth, getUserProfileController);

//logout
router.get("/logout", isAuth, userLogoutController);

//user profile update
router.put("/profile-update", isAuth, userProfileUpdateController);

//user password update
router.put("/password-update", isAuth, passwordUpdateController);

//profile pic update
router.put("/pic-update", isAuth, singleUpload, profilePicUpdateController);

//forgot password
router.post("/reset-password", passwordResetController);

export default router;
