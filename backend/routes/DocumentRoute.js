import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {getDocument,
        getDocumentById, 
        createDocument, 
        updateDocument, 
        deleteDocument,
        getLastDocumentId,
        getDocumentByCategory,
        createLogSign
} from "../controllers/DocumentController.js"; 

import { create } from "domain";

const router = express.Router(); 

const uploadPath = './uploads/files';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed.'));
    }
});

router.get('/document', getDocument); 
router.get('/document/category/:id_kategoridok', getDocumentByCategory);
router.get('/document/:id_dokumen', getDocumentById);
// router.post('/document', createDocument);  
router.patch('/document/:id_dokumen', updateDocument);
router.delete('/document/:id_dokumen', deleteDocument);
router.get('/getLastDocumentId', getLastDocumentId);
router.post("/document", upload.single("pdf-file"), createDocument);
router.post('/logsign', createLogSign);

export default router;