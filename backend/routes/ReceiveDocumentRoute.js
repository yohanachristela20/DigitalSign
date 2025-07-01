import express from "express";
import jwt, { decode } from 'jsonwebtoken';
import dotenv from 'dotenv';
import Document from "../models/DokumenModel.js";
import path from "path";
import multer from "multer";
import fs from "fs";


const router = express.Router();

router.get('/receive-document', async(req, res, next) => {
    const token = req.query.token;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    if (!token) {
        return res.status(401).json({message: 'Token is required!'});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log("Decoded token(receive document):", decoded);

        const dokumenLogsign = Array.isArray(decoded.dokumenLogsign) ? decoded.dokumenLogsign[0] : decoded.dokumenLogsign;
        console.log("Dokumen logsign:", dokumenLogsign);

        res.status(200).json({id_dokumen: dokumenLogsign});
    } catch (error) {
        return res.status(403).json({message: 'Invalid or expired token'});
    }
});

router.get('/pdf-document/:id_dokumen?', async (req, res) => {
    try {
        let { id_dokumen } = req.params;
        let pdfDoc;

        if (id_dokumen) {
            pdfDoc = await Document.findOne({ where: { id_dokumen } });
        } else {
            pdfDoc = await Document.findOne({ order: [["id_dokumen", "DESC"]] });
        }

        // console.log("Fetched document:", pdfDoc);

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