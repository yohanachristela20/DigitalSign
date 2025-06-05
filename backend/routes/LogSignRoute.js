import express from "express";

import {
    getLogSign, 
    // updateLogSign
} from "../controllers/LogSignController.js";

const router = express.Router();

router.get('/logsign', getLogSign);
// router.get('/logsign/:id_logsign', updateLogSign);

export default router;