import { Router } from "express";
import { signup } from "../controller/auth.controller";
import { login } from "../controller/auth.controller";
const router=Router();

router.post("/signup",signup);
router.post("/login",login);


export default router