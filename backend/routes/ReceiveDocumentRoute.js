import express from "express";
import jwt, { decode } from 'jsonwebtoken';
import Document from "../models/DokumenModel.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import LogSign from "../models/LogSignModel.js";
import Item from "../models/ItemModel.js";
import Karyawan from "../models/KaryawanModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/UserModel.js";
import Dokumen from "../models/DokumenModel.js";

dotenv.config();

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
        // console.log("Decoded token(receive document):", decoded);

        const dokumenLogsign = decoded.dokumenLogsign?.id_dokumen;
        // console.log("Dokumen logsign:", dokumenLogsign);

        const idSignerLogsign = decoded.dokumenLogsign?.id_signers;
        // const idSignerLogsign = receiver;
        // console.log("Id signer logsign:", idSignerLogsign);

        const urutanLogsign = decoded.dokumenLogsign?.urutan;
        // console.log("Urutan logsign:", urutanLogsign);

        const currentSigner = decoded.dokumenLogsign?.currentSigner;
        // console.log("Current signer:", currentSigner);

        const itemLogsign = decoded.dokumenLogsign?.id_item;
        // console.log("Id Item logsign:", itemLogsign);

        const idSenderLogsign = decoded.dokumenLogsign?.id_karyawan;
        // console.log("Id karyawan logsign:", idSenderLogsign);

        res.status(200).json({id_dokumen: dokumenLogsign, id_signers: idSignerLogsign, urutan: urutanLogsign, currentSigner, id_item: itemLogsign, id_karyawan: idSenderLogsign});
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
router.get('/axis-field/:id_dokumen/:id_signers/:id_item', async(req, res) => {
    const {id_dokumen, id_signers, urutan, id_item} = req.params;
    // console.log("Id Dokumen:", id_dokumen);
    // console.log("Id Signers:", id_signers);
    // console.log("Id Item:", id_item);
    // console.log("Urutan:", urutan);

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, id_signers, id_item}, 
            attributes: ["id_item", "id_signers", "status", "urutan", "is_submitted"],
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
        // console.log("Nama Signer:", namaSigner);

        res.status(200).json(response);
        // console.log("response:", response); 
    } catch (error) {
        console.log("error:", error.message);
    }
});


router.get('/decline/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers, id_sender} = req.params;
    // const {id_sender} = req.body;
    // console.log("Id Dokumen:", id_dokumen);
    // console.log("Id Signers:", id_signers);

    // console.log("Id Sender:", id_sender);

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, id_signers}, 
            attributes: ["id_signers", "id_dokumen", "createdAt"],
            include: [
                {
                    model: Karyawan, 
                    as: "Signerr",
                    attributes: ["nama", "organisasi"]
                }, 
                {
                    model: User,
                    as: 'Sender',
                    attributes: ["email"]
                },
                {
                    model: Dokumen, 
                    as: 'DocName',
                    attributes: ["nama_dokumen"]
                }
            ],
        });

        if(!response || response.length === 0) {
            return res.status(404).json({message: "Data not found"});
        }

        // console.log("createdAt:", response.createdAt);

        res.status(200).json(response);
        // console.log("response:", response); 
    } catch (error) {
        console.log("error:", error.message);
    }
});

router.get('/doc-info/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;
    // const {id_sender} = req.body;
    console.log("Id Dokumen:", id_dokumen);
    console.log("Id Signers:", id_signers);
    // console.log("ID Signers:", id_karyawan);

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, id_signers}, 
            attributes: ["id_signers", "id_dokumen", "createdAt", "id_karyawan", "status", "tgl_tt"],
            include: [
                {
                    model: Karyawan, 
                    as: "Signerr",
                    attributes: ["nama", "organisasi", "id_karyawan"],
                    include: [{
                        model: User,
                        as: 'Penerima', 
                        attributes: ["email"],
                    }]
                },
                {
                    model: Dokumen, 
                    as: 'DocName',
                    attributes: ["nama_dokumen"]
                }
            ],
        });

        if(!response || response.length === 0) {
            return res.status(404).json({message: "Data not found"});
        }

        // console.log("createdAt:", response.createdAt);

        // console.dir(response, { depth: null });

        const email = response?.Signerr?.Penerima?.email || null;
        // console.log("SIGNER EMAIL:", email);

        res.status(200).json(response);
        // console.log("response:", response); 
    } catch (error) {
        console.log("error:", error.message);
    }
});

router.get('/email-sender/:id_karyawan', async(req, res) => {
    const {id_karyawan} = req.params;

    // console.log("ID SENDER:", id_karyawan);

    try {
        const response = await LogSign.findAll({
            where: {id_karyawan}, 
            attributes: ["id_karyawan"],
            include: [
                {
                    model: Karyawan, 
                    as: "Signerr",
                    attributes: ["id_karyawan", "nama", "organisasi"],
                    include: [{
                        model: User,
                        as: 'Penerima', 
                        attributes: ["email"],
                    }]
                },
            ],
        });

        if(!response || response.length === 0) {
            return res.status(404).json({message: "Data not found"});
        }

        // console.log("createdAt:", response.createdAt);

        // console.dir(response, { depth: null });

        // const email = response[0]?.Signerr?.Penerima?.email || null;
        // console.log("SENDER EMAIL:", email);

        res.status(200).json(response);
        // console.log("response:", response); 
    } catch (error) {
        console.log("error:", error.message);
    }
});

// router.get('/audit-data/:id_dokumen/:id_signers', async(req, res) => {
//     const {id_dokumen, id_signers} = req.params;
//     // const {id_sender} = req.body;
//     // console.log("Id Dokumen:", id_dokumen);
//     // console.log("Id Signers:", id_signers);
//     // console.log("ID Signers:", id_karyawan);

//     try {
//         const response = await LogSign.findAll({
//             where: {id_dokumen, id_signers}, 
//             attributes: ["id_signers", "id_dokumen", "createdAt", "id_karyawan", "status"],
//             include: [
//                 {
//                     model: Karyawan, 
//                     as: "Signerr",
//                     attributes: ["id_karyawan"],
//                     include: [{
//                         model: User,
//                         as: 'Penerima', 
//                         attributes: ["email"],
//                     }]
//                 },
//                 {
//                     model: Dokumen, 
//                     as: 'DocName',
//                     attributes: ["nama_dokumen"]
//                 }
//             ],
//         });

//         if(!response || response.length === 0) {
//             return res.status(404).json({message: "Data not found"});
//         }

//         // const email = response?.Signerr?.Penerima?.email || null;
//         // console.log("SIGNER EMAIL:", email);

//         res.status(200).json(response);
//         // console.log("response:", response); 
//     } catch (error) {
//         console.log("error:", error.message);
//     }
// });


// untuk menampilkan nama di initialpad


router.get('/initials/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;
    const idSignerList = id_signers.split(',');

    // console.log("Id Dokumen:", id_dokumen);
    // console.log("Id Signers:", idSignerList);

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
        // console.log("Response:", response);
        res.status(200).json(response);
        
    } catch (error) {
        console.error("Failed to get imgBase64", error.message);
    }
});

router.patch('/update-submitted/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;
    const {is_submitted, status} = req.body;

    try {
        const submitted = await LogSign.update(
            {is_submitted, status},
            {
                where: {id_dokumen, id_signers},
            }
        );

        if(submitted[0] === 0) {
            return res.status(404).json({message: "No logsign records found to submitted."});
        }

        res.status(200).json({msg: "Document submitted successfully."});
    } catch (error) {
        console.error("Failed to submitted signed document.", error.message);
        res.status(500).json({message: error.message});
    }
});


router.patch('/update-status/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;
    const {status} = req.body;
    // const currentTime = new Date().toISOString().split("T")[0];
    const currentTime = new Date();

    // console.log("CURRENT TIME:", currentTime);

    try {
        const response = await LogSign.update(
            {status, tgl_tt: currentTime},
            {
                where: {id_dokumen, id_signers},
            }
        );

        res.status(200).json(response);
    } catch (error) {
        console.error("Failed to decline document.", error.message);
        res.status(500).json({message: error.message});
    }
});

router.post('/send-decline-email', async(req, res) => {
    try {
        const {id_dokumen, signerID, reason, token} = req.body;

        let emailResults = [];

        // console.log("RECEIVE DECLINE DATA:", "ID Dokumen:", id_dokumen, "signerID:", signerID, "reason:", reason, "token:", token);
        const declineLink = `http://localhost:3000/user/envelope?token=${token}`;

        const docName = await LogSign.findOne({
            where: {id_dokumen: id_dokumen}, 
            include: [{
                model: Dokumen, 
                as: "DocName",
                attributes: ["nama_dokumen"]
            }], 
            attributes: ["id_dokumen"]
        });

        const documentName = docName?.DocName?.nama_dokumen;
        // console.log("DOC NAME:", documentName);

        await sendEmailDeclineInternal(declineLink, reason, id_dokumen, signerID, documentName);
        emailResults.push({signerID, message: 'Decline email sent successfully.'});

        res.status(200).json({
            message: 'Decline email processed.',
            results: emailResults,
        });
    } catch (error) {
        console.error("Failed to send decline email:", error.message);
        res.status(500).json({ message: "Failed to send decline email." });
    }
});

const sendEmailDeclineInternal = async(declineLink, reason, id_dokumen, signerID, documentName) => {
    // console.log("declineLink", declineLink);
    // console.log("reason:", reason);
    // console.log("id_dokumen:", id_dokumen);
    // console.log("signerID:", signerID);

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            auth: {
                user: process.env.EMAIL_ADMIN, 
                pass: process.env.EMAIL_PASS_ADMIN, 
            }
        });

        const existingLog = await LogSign.findOne({
            where: {id_dokumen: id_dokumen, id_signers: signerID}, 
        });

        if (!existingLog) {
            console.warn(`Document ${id_dokumen} already deleted, skipping email.`);
            return;
        }

        const receiver = await Karyawan.findOne({
            where: {id_karyawan: signerID}, 
            include: [{
                model: User, 
                as: "Penerima", 
                attributes: ["email"]
            }], 
            attributes: ["id_karyawan"]
        }); 

        if (!receiver?.Penerima?.email) {
            console.warn(`Email not found for signer ${signerID}`);
            return;
        }

        const receiverEmail = receiver.Penerima.email;
        // const senderName = await Karyawan.findOne({where: {id_karyawan: id_karyawan}});
        const receiverName = await Karyawan.findOne({where: {id_karyawan: signerID}});

        const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: receiverEmail,
        subject: `Declined document: ${documentName}`,
        // html: <a href={declineLink}>Click link</a>, 
        text: `The Document was declined. \n
            ${receiverName?.nama || "Signer"} was declined to sign this document.\n
            As a result, the documents can not be completed for the following reasons: ${reason}. \n
            Click link to review the document ${declineLink}\n
            Please do not share this email and the link attached with others.\n\n
            Regards, \n
            Campina Sign.`
        };

        await transporter.sendMail(mailOptions);
        // console.log(`Email sent to ${receiverEmail} for signer ${signerID}`);

    } catch (error) {
        console.error("Failed to send decline email:", error.message);
        throw error;
    }
}

export default router;