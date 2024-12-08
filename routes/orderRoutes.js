import express from "express";
import {
  allOrdersGetController,
  getOneOrderController,
  myAllOrdersFetchController,
  orderCreateController,
  orderStatusUpdateController,
  paymentsAcceptController,
} from "../controllers/orderController.js";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

//order routes
//create
router.post("/create", isAuth, orderCreateController);

//all orders fetch
router.get("/my-orders", isAuth, myAllOrdersFetchController);

//fetch one order
router.get("/my-orders/:id", isAuth, getOneOrderController);

//payments accept
router.post("/payments", isAuth, paymentsAcceptController);

// -----------admin routes---------------
//all orders get
router.get("/admin/all-orders-get", isAuth, isAdmin, allOrdersGetController);

//order status update
router.put(
  "/admin/order-status-change/:id",
  isAuth,
  isAdmin,
  orderStatusUpdateController
);

export default router;
