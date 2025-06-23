import express from "express";

import {
    deleteLogsign,
    getLogSign,
    updateLogsign, 
    // updateLogSign
} from "../controllers/LogSignController.js";

const router = express.Router();

router.get('/logsign', getLogSign);
router.delete('/logsign/:id_signers', deleteLogsign);
router.patch('/logsign/:id_signers', updateLogsign);
// router.get('/logsign/:id_logsign', updateLogSign);

export default router;