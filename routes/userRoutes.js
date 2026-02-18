import express from "express";
import { register,verify, reVerify ,login,logout,forgotPassword,verifyOTP,changePassword,allUser,getUserById, updateProfile} from "../controller/userController.js";
import { isAuthenticated ,isAdmin} from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";
const router=express.Router();

router.post('/register', register);
router.post('/verify', verify);
router.post('/reverify', reVerify);
router.post('/login', login);
router.post('/logout' ,isAuthenticated, logout);
router.post('/forgotpassword', forgotPassword);
router.post('/verifyotp/:email', verifyOTP);
router.post('/changepassword/:email', changePassword);
router.get('/alluser',isAuthenticated,isAdmin,allUser);
router.get('/getUserById/:id',getUserById);
router.put('/updateprofile',isAuthenticated,singleUpload,updateProfile)


export default router;