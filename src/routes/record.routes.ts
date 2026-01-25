import { Router } from "express";
import { authMiddle } from "../middleware/authMiddle";
import { roleMiddle } from "../middleware/roleMiddle";
import {create,update,deleteRec} from "../controller/record.controller"
const router=Router();

router.post("/create",authMiddle,roleMiddle,create);
router.post("/update",authMiddle,roleMiddle,update);
router.post("/delete",authMiddle,roleMiddle,deleteRec);


export default router