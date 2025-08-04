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
import { Op } from "sequelize";

dotenv.config();

const router = express.Router();


// router.get('/receive-document', async(req, res, next) => {
//     const token = req.query.token;
//     const jwtSecret = process.env.JWT_SECRET_KEY;

//     if (!token) {
//         return res.status(401).json({message: 'Token is required!'});
//     }

//     try {
//         const decoded = jwt.verify(token, jwtSecret);

//         const dokumenLogsign = decoded.dokumenLogsign?.id_dokumen;
//         const idSignerLogsign = decoded.dokumenLogsign?.id_signers;
//         const urutanLogsign = decoded.dokumenLogsign?.urutan;
//         const currentSigner = decoded.dokumenLogsign?.currentSigner;
//         const itemLogsign = decoded.dokumenLogsign?.id_item;
//         const idSenderLogsign = decoded.dokumenLogsign?.id_karyawan;

//         const logsignRecord = await LogSign.findOne({
//             where: {
//                 id_dokumen: dokumenLogsign,
//                 id_signers: idSignerLogsign, 
//                 id_item: itemLogsign,
//             }, 
//             attributes: ['id_logsign']
//         });

//         const id_logsign = logsignRecord? logsignRecord.id_logsign : null;
//         console.log("LogSign Record:", logsignRecord);
//         console.log("Id logsign:", id_logsign);

//         res.status(200).json({id_dokumen: dokumenLogsign, id_signers: idSignerLogsign, urutan: urutanLogsign, currentSigner, id_item: itemLogsign, id_karyawan: idSenderLogsign, id_logsign});
//     } catch (error) {
//         return res.status(403).json({message: 'Invalid or expired token'});
//     }
// });

router.get('/receive-document', async(req, res) => {
    const token = req.query.token;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    if (!token) {
        return res.status(401).json({message: 'Token is required!'});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const {
            id_dokumen,
            id_signers,
            urutan, 
            currentSigner,
            id_item, 
            id_karyawan, 
            is_delegated, 
            delegated_signers
        } = decoded.dokumenLogsign || {};

        const finalSignerId = currentSigner || delegated_signers || id_signers ;
        if (!id_dokumen || !id_item || !id_karyawan || !urutan || !finalSignerId) {
            return res.status(400).json({
                message: 'Missing id_dokumen, id_signers or delegated_signers, id_item, id_karyawan, or urutan from token.'
            });
        }

        // console.log("FinalSignerId:", finalSignerId);
        // console.log("MAIN SIGNER ID:", id_signers);


        let logsignRecord;
        if (is_delegated) {
            logsignRecord = await LogSign.findOne({
                where: {
                    id_dokumen, 
                    id_signers,
                    id_item
                },
                attributes: ['id_logsign']
            });
        } else {
            logsignRecord = await LogSign.findOne({
                where: {
                    id_dokumen, 
                    id_signers: finalSignerId,
                    id_item
                },
                attributes: ['id_logsign']
            });
        }

        const id_logsign = logsignRecord? logsignRecord.id_logsign : null;
        // console.log("LogSign Record:", logsignRecord);
        // console.log("Id logsign:", id_logsign);

        res.status(200).json({
            id_dokumen, 
            id_signers: finalSignerId, 
            main_signer: id_signers,
            urutan,
            currentSigner, 
            id_item, 
            id_karyawan, 
            id_logsign, 
            is_delegated,
            delegated_signers: delegated_signers || null
        });

        // console.log("RECEIVE DOCUMENTTTT:", receiveData);
        
    } catch (error) {
        console.error("Receive document error:", error.message);
        return res.status(403).json({message: 'Invalid or expired token'});
    }
});

router.post('/link-access-log', async (req, res) => {
  const { token, real_email, password, is_accessed } = req.body;
  const jwtSecret = process.env.JWT_SECRET_KEY;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const {
        id_dokumen,
        id_signers,
        urutan, 
        currentSigner,
        id_item, 
        id_karyawan, 
        is_delegated, 
        delegated_signers
    } = decoded.dokumenLogsign || {};

    const finalSignerId = currentSigner || delegated_signers || id_signers ;
    if (!id_dokumen || !id_item || !id_karyawan || !urutan || !finalSignerId) {
        return res.status(400).json({
            message: 'Missing id_dokumen, id_signers or delegated_signers, id_item, id_karyawan, or urutan from token.'
        });
    }

    const signerId = currentSigner || delegated_signers || id_signers;
    console.log("signerId:", signerId);

    const logsign = await LogSign.findOne({
        where: { id_dokumen, [!is_delegated ? "id_signers" : "delegated_signers"] : signerId},
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

    if (!intended_email && isPasswordValid) {
        return res.status(404).json({ message: "Intended email not found for the current signer." });
    }

    const [accessLog, created] = await LinkAccessLog.findOrCreate({
        where: { id_logsign: logsign.id_logsign, id_karyawan: signerId },
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


router.get('/access-status', async(req, res) => {
    const {token} = req.query;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // console.log("CLIENT IP:", clientIP);

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const {
            id_dokumen,
            id_signers,
            urutan, 
            currentSigner,
            id_item, 
            id_karyawan, 
            is_delegated, 
            delegated_signers
        } = decoded.dokumenLogsign || {};

        const signerId = currentSigner || delegated_signers  || id_signers;

        const logsign = await LogSign.findOne({
            where: {id_dokumen, [!is_delegated ? "id_signers" : "delegated_signers"] : signerId},
            attributes: ['id_logsign', 'id_signers', 'delegated_signers'],
        });

        if (!logsign) {
            return res.status(404).json({ message: "LogSign not found", is_accessed: false });
        }

        const accessLogs = await LinkAccessLog.findOne({
            where: {id_logsign: logsign.id_logsign, id_karyawan: signerId}, 
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
// router.get('/axis-field/:id_dokumen/:id_signers/:id_item', async(req, res) => {
//     const {id_dokumen, id_signers, id_item} = req.params;
//     console.log("Axis field data:", id_dokumen, id_signers, id_item);

//     try {
        
//         const response = await LogSign.findAll({
//             where: {id_dokumen, id_signers, id_item}, 
//             attributes: ["id_item", "id_signers", "status", "urutan", "is_submitted"],
//             include: [
//                 {
//                     model: Item,
//                     as: "ItemField",
//                     attributes: ["jenis_item", "x_axis", "y_axis", "width", "height", "id_item"]
//                 },
//                 {
//                     model: Karyawan, 
//                     as: "Signerr",
//                     attributes: ["nama"]
//                 }
//             ],
//         });

//         // const namaSigner = response[0]?.Signerr?.nama || null;

//         res.status(200).json(response);
//     } catch (error) {
//         console.log("error:", error.message);
//     }
// });

router.get('/axis-field/:id_dokumen/:id_signers/:id_item', async (req, res) => {
    const { id_dokumen, id_signers, id_item } = req.params;
    console.log("Axis field data:", id_dokumen, id_signers, id_item);

    try {
        const signerInfo = await LogSign.findOne({
            where: { id_dokumen, id_signers },
            attributes: ["is_delegated"]
        });

        let targetSigner = id_signers;

        if (signerInfo?.is_delegated) {
            const mainSignerRow = await LogSign.findOne({
                where: { id_dokumen, is_delegated: true },
                attributes: ["id_signers"]
            });
            if (mainSignerRow) {
                targetSigner = mainSignerRow.id_signers;
                console.log(`Delegated signer detected → using main signer ID: ${targetSigner}`);
            }
        }

        // Get axis-field for the main or current signer
        const response = await LogSign.findAll({
            where: { id_dokumen, id_signers: targetSigner, id_item },
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
            ]
        });

        res.status(200).json(response);
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ error: error.message });
    }
});





router.get('/decline/:id_dokumen/:finalSignerId', async(req, res) => {
    const {id_dokumen, id_signers, finalSignerId, delegated_signers} = req.params;
    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, [Op.or] : [
                {id_signers: finalSignerId},
                {delegated_signers: finalSignerId}
            ]},  
            attributes: ["id_signers", "delegated_signers", "id_dokumen", "createdAt"],
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

        res.status(200).json(response);
    } catch (error) {
        console.log("error:", error.message);
    }
});

// router.get('/doc-info/:id_dokumen/:id_signers', async(req, res) => {
//     const {id_dokumen, id_signers} = req.params;
//     console.log("Id Dokumen:", id_dokumen);
//     console.log("Id Signers:", id_signers);

//     try {
//         const response = await LogSign.findAll({
//             where: {id_dokumen, id_signers}, 
//             attributes: ["id_signers", "id_dokumen", "createdAt", "id_karyawan", "status", "tgl_tt", "is_submitted"],
//             include: [
//                 {
//                     model: Karyawan, 
//                     as: "Signerr",
//                     attributes: ["nama", "organisasi", "id_karyawan"],
//                     include: [{
//                         model: User,
//                         as: 'Penerima', 
//                         attributes: ["email"],
//                     }]
//                 },
//                 {
//                     model: Dokumen, 
//                     as: 'DocName',
//                     attributes: ["nama_dokumen"],
//                 }, 
//                 {
//                     model: LinkAccessLog, 
//                     as: 'LinkAccess', 
//                     attributes: ['accessed_at', 'real_email'], 
//                 }
//             ],
//         });

//         if(!response || response.length === 0) {
//             return res.status(404).json({message: "Data not found"});
//         }


//         const email = response?.Signerr?.Penerima?.email || null;

//         res.status(200).json(response);
//     } catch (error) {
//         console.log("error:", error.message);
//     }
// });



//Draft
// router.get('/doc-info/:id_dokumen/:delegated_signers', async(req, res) => {
//     const {id_dokumen, delegated_signers} = req.params;
//     console.log("Id Dokumen:", id_dokumen);
//     console.log("Delegated Signers:", delegated_signers);

//     try {
//         const response = await LogSign.findAll({
//             where: {id_dokumen, delegated_signers}, 
//             attributes: ["id_signers", "delegated_signers", "id_dokumen", "createdAt", "id_karyawan", "status", "tgl_tt", "is_submitted"],
//             include: [
//                 {
//                     model: Karyawan, 
//                     as: "Signerr",
//                     attributes: ["nama", "organisasi", "id_karyawan"],
//                     include: [{
//                         model: User,
//                         as: 'Penerima', 
//                         attributes: ["email"],
//                     }]
//                 },
//                 {
//                     model: Dokumen, 
//                     as: 'DocName',
//                     attributes: ["nama_dokumen"],
//                 }, 
//                 {
//                     model: LinkAccessLog, 
//                     as: 'LinkAccess', 
//                     attributes: ['accessed_at', 'real_email'], 
//                 }
//             ],
//         });

//         if(!response || response.length === 0) {
//             return res.status(404).json({message: "Data not found"});
//         }


//         // const email = response?.Signerr?.Penerima?.email || null;

//         res.status(200).json(response);
//     } catch (error) {
//         console.log("Error doc-info:", error.message);
//         res.status(500).json({message: "Error fetching doc-info"});
//     }
// });

router.get('/doc-info/:id_dokumen/:finalSignerId', async(req, res) => {
    const {id_dokumen, finalSignerId} = req.params;
    // console.log("Id Dokumen:", id_dokumen);
    // console.log("Final Signers:", finalSignerId);

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, [Op.or] : [
                {id_signers: finalSignerId},
                {delegated_signers: finalSignerId}
            ]}, 
            attributes: ["id_signers", "delegated_signers", "id_dokumen", "createdAt", "id_karyawan", "status", "tgl_tt", "is_submitted"],
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

        res.status(200).json(response);
    } catch (error) {
        console.log("Error doc-info:", error.message);
        res.status(500).json({message: "Error fetching doc-info"});
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

        const email = response[0]?.Signerr?.Penerima?.email || null;
        // console.log("SENDER EMAIL:", email);

        res.status(200).json(response);
        // console.log("RESPONSE EMAIL SENDER:", response); 
    } catch (error) {
        console.log("error:", error.message);
    }
});

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


router.patch('/delegate-doc/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;
    const {is_delegated, delegated_signers} = req.body;

    try {
        const response = await LogSign.update(
            {is_delegated, delegated_signers},
            {
                where: {id_dokumen, id_signers},
            }
        );

        res.status(200).json(response);
    } catch (error) {
        console.error("Failed to delegate document.", error.message);
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
};

router.post('/send-delegate-email', async(req, res) => {
    try {
        const {id_dokumen, delegated_signers, token} = req.body;
        const jwtSecret = process.env.JWT_SECRET_KEY;

        if (!jwtSecret) throw new Error("JWT_SECRET_KEY is not set");

        const decoded = jwt.verify(token, jwtSecret);
        const {
            id_dokumen: docFromToken,
            id_signers, 
            urutan, 
            id_item, 
            id_karyawan
        } = decoded.dokumenLogsign || {};

        const finalDocId = id_dokumen || docFromToken;

        // console.log("Main signer id send email:", id_signers);

        const delegateList = [...new Set(Array.isArray(delegated_signers) ? delegated_signers : [delegated_signers])];
        let emailResults = [];

        const docName = await LogSign.findOne({
            where: {id_dokumen: finalDocId}, 
            include: [{
                model: Dokumen, 
                as: "DocName",
                attributes: ["nama_dokumen"]
            }], 
            attributes: ["id_dokumen"]
        });

        const documentName = docName?.DocName?.nama_dokumen;

        for (const delegateId of delegateList) {
            const receiver = await Karyawan.findOne({
                where: {id_karyawan: delegateId}, 
                include: [{
                    model: User,
                    as: "Penerima",
                    attributes: ["email"]
                }],
                attributes: ["id_karyawan", "nama"]
            });

            if (!receiver?.Penerima?.email){
                console.warn(`Email not found for delegated signer ${delegateId}`);
                emailResults.push({delegateId, message: 'Email not found'});
                continue;
            }

            const intended_email = receiver.Penerima.email;

            //new token for delegated signer
            const newToken = jwt.sign({
                dokumenLogsign: {
                    id_dokumen: finalDocId, 
                    id_signers,
                    delegated_signers: delegateId, 
                    urutan, 
                    currentSigner: delegateId, 
                    id_item, 
                    id_karyawan, 
                    is_delegated: true, 
                    intended_email
                }
            }, jwtSecret);

            const delegateLink = `http://localhost:3000/user/envelope?token=${newToken}`;
            await sendEmailDelegateInternal(delegateLink, documentName, receiver.nama, intended_email);
            emailResults.push({delegateId, message: 'Delegate email sent successfully.'});
        }

        res.status(200).json({
            message: 'Delegate email processed.',
            results: emailResults,
        });
    } catch (error) {
        console.log("Failed to send delegate email:", error.message);
        res.status(500).json({ message: "Failed to send delegate email." });
    }
});


const sendEmailDelegateInternal = async(delegateLink, documentName, receiverName, receiverEmail) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            auth: {
                user: process.env.EMAIL_ADMIN, 
                pass: process.env.EMAIL_PASS_ADMIN, 
            }
        });

        const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: receiverEmail,
        subject: `You are delegated to sign: ${documentName}`,
        // html: <a href={declineLink}>Click link</a>, 
        text: `${receiverName?.nama || "Signer"}, You are delegated to sign a document ${documentName}}.\n
          Please review and check the document before signing it.\n
          Click link to sign the document ${delegateLink}\n\n
          Please do not share this email and the link attached with others.\n
          Regards, \n
          Campina Sign.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Delegate email sent to ${receiverName?.nama }`);

    } catch (error) {
        console.error("Failed to send delegate email:", error.message);
        throw error;
    }
}

export default router;