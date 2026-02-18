import express from "express";
import { createOrder, getMyOrder, getUserOrders ,getAllOrdersAdmin ,getSalesData } from "../controller/ordercontroller.js";




import { isAuthenticated, isAdmin } from "../middleware/isAuthenticated.js";
const router = express.Router();

router.post("/createorder", isAuthenticated, createOrder);
router.get("/myorders", isAuthenticated, getMyOrder);
router.get('/orderdetails/:userId', isAuthenticated, isAdmin, getUserOrders);
router.get('/all', isAuthenticated, isAdmin, getAllOrdersAdmin);
router.get('/sales', isAuthenticated, isAdmin, getSalesData);

export default router;