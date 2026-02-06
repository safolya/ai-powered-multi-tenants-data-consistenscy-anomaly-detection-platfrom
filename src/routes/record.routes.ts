import { Router } from "express";
import { authMiddle } from "../middleware/authMiddle";
import { roleMiddle } from "../middleware/roleMiddle";
import {create,update,deleteRec,rollbackRec,records} from "../controller/record.controller"
const router=Router();

router.get("/records",authMiddle,roleMiddle,records)
router.post("/create",authMiddle,roleMiddle,create);
router.post("/:recordId/update",authMiddle,roleMiddle,update);
router.post("/:recordId/delete",authMiddle,roleMiddle,deleteRec);
router.post("/rollback/:trackId",authMiddle,rollbackRec);



export default router