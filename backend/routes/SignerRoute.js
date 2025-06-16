import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/database.js";

import { getSigner, createSigner, getSignerById, getSignerDetails } from "../controllers/SignersController.js";
import Karyawan from "../models/KaryawanModel.js";
import Signers from "../models/SignersModel.js";

const router = express.Router();

router.get('/signer', getSigner);
router.get('/signer/:id_signers', getSignerById);
router.post('/signer', createSigner);
router.get('/getSignerDetails', getSignerDetails);

// router.get('/selectedSigner/:id_signers?', async (req, res) => {
//     try {
//         let { id_signers } = req.params;
//         let signerChoosen;

//         if (id_signers) {
//             signerChoosen = await Signers.findAll({ 
//                 where: { id_signers },
//                 include: [{ model: Karyawan, as: 'Penandatangan', attributes: ['nama'] }]
//             });
//         } else {
//             signerChoosen = await Signers.findAll({ 
//                 order: [["id_signers", "DESC"]],
//                 include: [{ model: Karyawan, as: 'Penandatangan', attributes: ['nama'] }]
//             });
//         }

//         console.log("Signer choosen: ", signerChoosen);
//         res.status(200).json(signerChoosen);
//     } catch (error) {
//         console.error("Error fetching document:", error.message);
//         res.status(500).json({ message: "Error fetching document." });
//     }
// });

export default router;