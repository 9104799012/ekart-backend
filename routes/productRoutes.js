import express from "express";
import { addProduct ,getAllProduct,deleteProduct,updateProduct} from "../controller/productController.js";

import {multipleUpload  } from "../middleware/multer.js";


import { isAuthenticated ,isAdmin} from "../middleware/isAuthenticated.js";
const router=express.Router();

router.post("/addproduct",isAuthenticated,isAdmin,multipleUpload,addProduct);
router.get('/getallproducts',getAllProduct);
router.delete('/deleteproduct/:productId',isAuthenticated,isAdmin,deleteProduct);
router.put('/updateproduct/:productId',isAuthenticated,isAdmin,multipleUpload,updateProduct);

export default router;