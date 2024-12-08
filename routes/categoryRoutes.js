import express from "express";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  categoryAllGetController,
  categoryCreateController,
  categoryDeleteController,
  categoryUpdateController,
} from "../controllers/categoryController.js";

const router = express.Router();

// category routes
// category create
router.post("/create", isAuth, isAdmin, categoryCreateController);

// all categories fetch
router.get("/all-get", categoryAllGetController);

// category delete
router.delete("/delete/:id", isAuth, isAdmin, categoryDeleteController);

// category update
router.put("/update/:id", isAuth, isAdmin, categoryUpdateController);

export default router;
