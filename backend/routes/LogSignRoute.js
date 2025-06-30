import express from "express";

import {
    getLastLogsignId,
    getLogSign,
    updateLogsign,
    updateReminder, 
} from "../controllers/LogSignController.js";

const router = express.Router();

router.get('/logsign', getLogSign);
router.patch('/logsign/:id_dokumen/:id_item/:id_signers', updateLogsign);
router.patch('/update-reminder/:id_dokumen', updateReminder);
router.get('/getLastLogsignId', getLastLogsignId);

export default router;