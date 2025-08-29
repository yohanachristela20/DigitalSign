import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Document from "../models/DokumenModel.js";

import {getDocument,
        getDocumentById, 
        createDocument, 
        updateDocument, 
        deleteDocument,
        getLastDocumentId,
        getDocumentByCategory,
        createLogSign,
        createItem, 
        deleteSign, 
        deleteLogsign, 
        updateReminder,
        sendEmailNotification,
        getSignLink,
        updateInitialSign,
        // deleteSigner
} from "../controllers/DocumentController.js"; 
import LogSign from "../models/LogSignModel.js";

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
router.post('/item', createItem);
router.delete('/delete-sign/:id_logsign', deleteSign);
router.delete('/logsign/:id_dokumen/:id_item/:id_signers', deleteLogsign);
// router.delete('/delete-signer/:id_signers', deleteSigner);

router.patch('/update-reminder/:id_dokumen', updateReminder);
router.post('/send-email', sendEmailNotification);
router.get("/logsign-link/:id_dokumen", getSignLink);

router.patch('/initialsign/:id_dokumen/:id_item/:id_signers', updateInitialSign);


router.get('/document-status', async (req, res) => {
    const statusList = await LogSign.findAll({
        attributes: ['id_dokumen', 'status'],
        group: ['id_dokumen'],
        include: [
            {
                model: Document,
                as: 'Dokumen',
                attributes: ['nama_dokumen']
            }
        ]
    });
    res.json(statusList);
});



export default router;