import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/database.js";
import Document from "../models/DokumenModel.js";

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

// router.get('/pdf-document', async(req, res) => {
//     try {
//         const lastDoc = await Document.findOne({
//             attributes: ["id_dokumen", "filepath_dokumen"],
//             order: [["id_dokumen", "DESC"]], 
//             raw: true,
//         });

//         console.log("Last document: ", lastDoc);

//         if (!lastDoc) {
//             return res.status(404).json({message: "Document not found."});
//         }

//         // console.log("Last document: ", lastDoc);
//         res.status(200).json({lastDoc});
//     } catch (error) {
//         console.error("Error fetching document:", error.message);
//         res.status(500).json({message: "Error fetching document."});
//     }
// });

router.get('/pdf-document/:id_dokumen?', async (req, res) => {
    try {
        let { id_dokumen } = req.params;
        let pdfDoc;

        if (id_dokumen) {
            pdfDoc = await Document.findOne({ where: { id_dokumen } });
        } else {
            pdfDoc = await Document.findOne({ order: [["id_dokumen", "DESC"]] });
        }

        console.log("Fetched document:", pdfDoc);

        if (!pdfDoc || !pdfDoc.filepath_dokumen) {
            return res.status(404).json({ message: "Document not found." });
        }

        const filePath = path.join(process.cwd(), pdfDoc.filepath_dokumen);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found on server." });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error("Error fetching document:", error.message);
        res.status(500).json({ message: "Error fetching document." });
    }
});


export default router;