import express from "express";
import {
  getAllProductsController,
  productCreateController,
  productDeleteController,
  productImageDeleteController,
  productImagesUpdationController,
  productReviewController,
  productUpdationController,
  singleProductGetController,
  topProductGetController,
} from "../controllers/productController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

//routes
//get all products
router.get("/all-get", getAllProductsController);

//get top products
router.get("/top", topProductGetController);

//get product
router.get("/:id", singleProductGetController);

//product create
router.post("/create", isAuth, isAdmin, singleUpload, productCreateController);

//product update
router.put("/:id", isAuth, isAdmin, productUpdationController);

//product images update
router.put(
  "/images/:id",
  isAuth,
  isAdmin,
  singleUpload,
  productImagesUpdationController
);

//product image delete
router.delete(
  "/image-delete/:id",
  isAuth,
  isAdmin,
  productImageDeleteController
);

//product delete
router.delete("/:id", isAuth, isAdmin, productDeleteController);

//product review
router.put("/:id/review", isAuth, productReviewController);

export default router;
