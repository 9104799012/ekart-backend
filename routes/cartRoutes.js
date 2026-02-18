import express from "express";
import { addToCart,getCart,removeFromCart,updateQuantity} from "../controller/cartController.js";




import { isAuthenticated } from "../middleware/isAuthenticated.js";
const router=express.Router();

router.post("/addtocart",isAuthenticated,addToCart);
router.put('/updatequantity',isAuthenticated,updateQuantity);
router.get('/get',isAuthenticated,getCart);
router.delete('/remove',isAuthenticated,removeFromCart);

export default router;