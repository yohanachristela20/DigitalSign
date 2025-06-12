import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/database.js";

import { getLastItemId } from "../controllers/ItemController.js";

const router = express.Router();

router.get('/getLastItemId', getLastItemId);

export default router;