import express from "express";
import jwt, { decode } from 'jsonwebtoken';
import Document from "../models/DokumenModel.js";
import path from "path";
import multer from "multer";
import fs, { access } from "fs";
import LogSign from "../models/LogSignModel.js";
import Item from "../models/ItemModel.js";
import Karyawan from "../models/KaryawanModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/UserModel.js";
import Dokumen from "../models/DokumenModel.js";
import LinkAccessLog from "../models/linkAccessModel.js";
import bcrypt from 'bcrypt';
import { where } from "sequelize";

dotenv.config();

const router = express.Router();


router.get('/receive-document', async(req, res, next) => {
    const token = req.query.token;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    if (!token) {
        return res.status(401).json({message: 'Token is required!'});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);

        const dokumenLogsign = decoded.dokumenLogsign?.id_dokumen;
        const idSignerLogsign = decoded.dokumenLogsign?.id_signers;
        const urutanLogsign = decoded.dokumenLogsign?.urutan;
        const currentSigner = decoded.dokumenLogsign?.currentSigner;
        const itemLogsign = decoded.dokumenLogsign?.id_item;
        const idSenderLogsign = decoded.dokumenLogsign?.id_karyawan;

        const logsignRecord = await LogSign.findOne({
            where: {
                id_dokumen: dokumenLogsign,
                id_signers: idSignerLogsign, 
                id_item: itemLogsign,
            }, 
            attributes: ['id_logsign']
        });

        const id_logsign = logsignRecord? logsignRecord.id_logsign : null;
        console.log("LogSign Record:", logsignRecord);
        console.log("Id logsign:", id_logsign);

        res.status(200).json({id_dokumen: dokumenLogsign, id_signers: idSignerLogsign, urutan: urutanLogsign, currentSigner, id_item: itemLogsign, id_karyawan: idSenderLogsign, id_logsign});
    } catch (error) {
        return res.status(403).json({message: 'Invalid or expired token'});
    }
});

router.post('/link-access-log', async (req, res) => {
  const { token, real_email, password, is_accessed } = req.body;
  const jwtSecret = process.env.JWT_SECRET_KEY;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const { dokumenLogsign } = decoded;
    const { currentSigner, id_dokumen } = dokumenLogsign;

    // console.log("Decoded token for link access log:", decoded);
    // console.log("Current signer for link access log:", currentSigner);
    // console.log("Id dokumen for link access log:", id_dokumen);
    // console.log("Dokumen logsign for link access log:", dokumenLogsign);

    const logsign = await LogSign.findOne({
        where: { id_dokumen, id_signers: currentSigner },
        include: [{
            model: Karyawan,
            as: 'Signerr',
            include: [{
                model: User,
                as: 'Penerima',
                attributes: ['email', 'password']
            }]
        }]
    });

    const intended_email = logsign?.Signerr?.Penerima?.email;
    const intended_password = logsign?.Signerr?.Penerima?.password;

    const isPasswordValid = await bcrypt.compare(password, intended_password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Incorrect password.' });
    }


    if (real_email !== intended_email && isPasswordValid) {
        return res.status(403).json({ message: "Unauthorized email" });
    }

    // console.log("Intended email:", intended_email);
    if (!intended_email && isPasswordValid) {
        return res.status(404).json({ message: "Intended email not found for the current signer." });
    }

    const [accessLog, created] = await LinkAccessLog.findOrCreate({
        where: { id_logsign: logsign.id_logsign, id_karyawan: currentSigner },
        defaults: {
            intended_email,
            real_email,
            accessed_at: new Date(),
            is_accessed: is_accessed || "",
        }
    });


    if (!created) {
        await accessLog.update({
            real_email, 
            accessed_at: new Date(),
        });
    }

    res.status(200).json({ message: "Link access recorded" });

  } catch (err) {
    
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// router.get('/access-status', async(req, res) => {
//     const {id_logsign, id_karyawan} = req.query;
//     console.log("Id LogSign:", id_logsign);
//     console.log("Id Karyawan:", id_karyawan);

//     // const clientIp = req.ip;

//     const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//     // const ipOnly = clientIP.replace("::ffff:", "");
//     console.log("CLIENT IP:", clientIP);
//     // console.log("IP ONLY:", ipOnly);


//     try {
//         const accesslog = await LinkAccessLog.findOne({
//             where: {id_logsign, id_karyawan}, 
//             attributes: ['is_accessed'],
//         });

//         console.log("LogSign for access status:", accesslog);

//         if (!accesslog) {
//             return res.status(200).json({ is_accessed: null });
//         }

//         res.status(200).json({ is_accessed: accesslog.is_accessed });

//     } catch (error) {
//         res.status(500).json({ message: "Error fetching access status.", is_accessed: false});
//     }
// });


//last
// router.get('/access-status', async(req, res) => {
//     const {id_dokumen, id_karyawan, id_signers, token} = req.query;
//     // console.log("Id LogSign:", id_logsign);
//     // console.log("Id Karyawan:", id_karyawan);

//     console.log("ID dokumen:", id_dokumen);

//     // const clientIp = req.ip;

//     const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//     // const ipOnly = clientIP.replace("::ffff:", "");
//     console.log("CLIENT IP:", clientIP);
//     // console.log("IP ONLY:", ipOnly);

//     try {
//         const decoded = jwt.verify(token, jwtSecret);
//         const { dokumenLogsign } = decoded;
//         const { currentSigner, id_dokumen } = dokumenLogsign;

//         const logsign = await LogSign.findOne({
//             where: {id_dokumen, id_signers: currentSigner},
//             attributes: ['id_logsign'],
//         });

//         console.log("LOGSIGNNN:", logsign)

//         // const logsignIds = allLogsigns.map(log => log.id_logsign);
//         // let whereClause = { id_logsign: logsignIds };

//         // if (id_signers) {
//         //     whereClause.id_karyawan = id_signers;
//         // }
//         if (!logsign) {
//             return res.status(404).json({ message: "LogSign not found", is_accessed: false });
//         }

//         const accessLogs = await LinkAccessLog.findOne({
//             where: {id_logsign: logsign.id_logsign, id_karyawan: logsign.id_signers}, 
//             attributes: ['is_accessed'], 
//         });

//         console.log("ACCESS LOG:", accessLogs);

//         const isAccessed = accessLogs?.is_accessed;
//         console.log("IS ACCESSED:", isAccessed);

//         res.status(200).json({is_accessed: isAccessed});
//     } catch (error) {
//         console.error("Error checking access:", error);
//         res.status(500).json({message: "Error fetching access status.", is_accessed: false});
//     }
// });

router.get('/access-status', async(req, res) => {
    const {token} = req.query;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // const ipOnly = clientIP.replace("::ffff:", "");
    console.log("CLIENT IP:", clientIP);
    // console.log("IP ONLY:", ipOnly);

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const { dokumenLogsign } = decoded;
        const { currentSigner, id_dokumen } = dokumenLogsign;

        const logsign = await LogSign.findOne({
            where: {id_dokumen, id_signers: currentSigner},
            attributes: ['id_logsign', 'id_signers'],
        });

        if (!logsign) {
            return res.status(404).json({ message: "LogSign not found", is_accessed: false });
        }

        const accessLogs = await LinkAccessLog.findOne({
            where: {id_logsign: logsign.id_logsign, id_karyawan: logsign.id_signers}, 
            attributes: ['is_accessed'], 
        });

        const isAccessed = accessLogs?.is_accessed === true;
        res.status(200).json({is_accessed: isAccessed});

    } catch (error) {
        console.error("Error checking access:", error);
        res.status(500).json({message: "Error fetching access status.", is_accessed: false});
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
            attributes: ["id_signers", "id_dokumen", "createdAt", "id_karyawan", "status", "tgl_tt", "is_submitted"],
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
                    attributes: ["nama_dokumen"],
                }, 
                {
                    model: LinkAccessLog, 
                    as: 'LinkAccess', 
                    attributes: ['accessed_at', 'real_email'], 
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

    console.log("ID SENDER:", id_karyawan);

    try {
        const response = await LogSign.findAll({
            where: {id_karyawan}, 
            attributes: ["id_karyawan"],
            include: [
                {
                    model: Karyawan, 
                    as: "Pemohon",
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

        const email = response[0]?.Signerr?.Penerima?.email || null;
        console.log("SENDER EMAIL:", email);

        res.status(200).json(response);
        console.log("RESPONSE EMAIL SENDER:", response); 
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