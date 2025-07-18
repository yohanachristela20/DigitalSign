import express from "express";
import jwt, { decode } from 'jsonwebtoken';
import dotenv from 'dotenv';
import Document from "../models/DokumenModel.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import LogSign from "../models/LogSignModel.js";
import Item from "../models/ItemModel.js";
import Karyawan from "../models/KaryawanModel.js";


const router = express.Router();


router.get('/receive-document', async(req, res, next) => {
    const token = req.query.token;
    // const receiver = req.query.receiver;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    if (!token) {
        return res.status(401).json({message: 'Token is required!'});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log("Decoded token(receive document):", decoded);

        const dokumenLogsign = decoded.dokumenLogsign?.id_dokumen;
        console.log("Dokumen logsign:", dokumenLogsign);

        const idSignerLogsign = decoded.dokumenLogsign?.id_signers;
        // const idSignerLogsign = receiver;
        console.log("Id signer logsign:", idSignerLogsign);

        const urutanLogsign = decoded.dokumenLogsign?.urutan;
        console.log("Urutan logsign:", urutanLogsign);

        const currentSigner = decoded.dokumenLogsign?.currentSigner;
        console.log("Current signer:", currentSigner);

        res.status(200).json({id_dokumen: dokumenLogsign, id_signers: idSignerLogsign, urutan: urutanLogsign, currentSigner});
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

// untuk menampilkan field item (kotak hijau)
router.get('/axis-field/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers, urutan} = req.params;
    console.log("Id Dokumen:", id_dokumen);
    console.log("Id Signers:", id_signers);
    // console.log("Urutan:", urutan);

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, id_signers}, 
            attributes: ["id_item", "id_signers", "status", "urutan"],
            include: [
                {
                    model: Item,
                    as: "ItemField",
                    attributes: ["jenis_item", "x_axis", "y_axis", "width", "height", "id_item"]
                },
                {
                    model: Karyawan, 
                    as: "Signerr",
                    attributes: ["nama"]
                }
            ],
        });

        const namaSigner = response[0]?.Signerr?.nama || null;
        console.log("Nama Signer:", namaSigner);

        res.status(200).json(response);
        console.log("response:", response); 
    } catch (error) {
        console.log("error:", error.message);
    }
});


// untuk menampilkan nama di initialpad
router.get('/initials/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;
    const idSignerList = id_signers.split(',');

    console.log("Id Dokumen:", id_dokumen);
    console.log("Id Signers:", idSignerList);

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, id_signers: idSignerList},
            attributes: ["sign_base64", "status", "id_item", "id_signers"],
            include: [
                {
                    model: Karyawan,
                    as: "Signerr",
                    attributes: ["nama"],
                }
            ]
        }); 
        console.log("Response:", response);
        res.status(200).json(response);
        
    } catch (error) {
        console.error("Failed to get imgBase64", error.message);
    }
});

export default router;