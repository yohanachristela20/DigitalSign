import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Document from "../models/DokumenModel.js";
import LogSign from "../models/LogSignModel.js";
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

import sendEmailToSigner from "../helpers/sendEmailHelper.js";

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

router.get('/document-deadline', async (req, res) => {
    const deadlineList = await LogSign.findAll({
        attributes: ['id_dokumen', 'deadline'],
        group: ['id_dokumen'],
        include: [
            {
                model: Document,
                as: 'Dokumen',
                attributes: ['nama_dokumen']
            }
        ]
    });
    res.json(deadlineList);
});

router.get('/submitted-doc', async (req, res) => {
    const submittedList = await LogSign.findAll({
        attributes: ['id_dokumen', 'is_submitted'],
        group: ['id_dokumen'],
        include: [
            {
                model: Document,
                as: 'Dokumen',
                attributes: ['nama_dokumen']
            }
        ]
    });
    res.json(submittedList);
});


router.post("/send-reminder", async (req, res) => {
    try {
        const {id_dokumen} = req.body;

        if (!id_dokumen) {
            return res.status(400).json({ message: "id_dokumen is required" });
        }

        const logs = await LogSign.findAll({
            where: { id_dokumen },
            include: [{model: Document, as:"Dokumen"}]
        });

        if (!logs.length) {
            return res.status(404).json({ message: "No logsign entries found for the given document ID" });
        }

        for (const log of logs) {
            if (log.status === "Pending") {
                await sendEmailToSigner(log);
            }
        }

        res.json({ success: true, message: "Reminder emails sent successfully." });
    } catch (error) {
        console.error("Error sending reminder emails:", error);
        res.status(500).json({message: "Failed to send reminder emails." });
    }
});


export default router;