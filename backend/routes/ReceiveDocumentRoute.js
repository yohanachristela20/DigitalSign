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
import { sign } from "crypto";

dotenv.config();

const router = express.Router();


router.get('/receive-document', async(req, res) => {
    const token = req.query.token;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    if (!token) {
        return res.status(401).json({message: 'Token is required!'});
    }

    try {
        const decodeRaw = jwt.decode(token);

        if (!decodeRaw || !decodeRaw.dokumenLogsign){
            return res.status(400).json({message: 'Invalid token payload'});
        }

        const {
            id_dokumen,
            id_signers,
            urutan, 
            currentSigner,
            id_item, 
            id_karyawan, 
            is_delegated, 
            delegated_signers, 
            deadline,
        } = decodeRaw.dokumenLogsign;

        const finalSignerId = is_delegated ? delegated_signers : id_signers ;
        if (!id_dokumen || !id_item || !id_karyawan || !urutan || !finalSignerId) {
            return res.status(400).json({
                message: 'Missing id_dokumen, id_signers or delegated_signers, id_item, id_karyawan, or urutan from token.'
            });
        }

        const logsignRecord = await LogSign.findOne({
            where: {
                id_dokumen,
                id_signers, 
                id_item
            }, 
            attributes: ['id_logsign', 'main_token', 'delegate_token']
        });

        // console.log("LOGSIGN RECORDDD:", logsignRecord);

        // const id_logsign = logsignRecord ? logsignRecord.id_logsign : null;
        // const main_token = logsignRecord ? logsignRecord.main_token : null;
        // const delegate_token = logsignRecord ? logsignRecord.delegate_token : null;

        const { id_logsign, main_token, delegate_token, status, sign_permission } = logsignRecord;

        if (status === 'Pending'){
            try {
                jwt.verify(token, jwtSecret);
            } catch (error) {
                console.error('Receive document error (expired token on Pending):', err.message);
                return res.status(403).json({message: 'Invalid or expired token'});
            }
        } else if (status === 'Completed') {
            console.log('Status completed, bypass token expiry.');
        }

        res.status(200).json({
            id_dokumen, 
            id_signers, 
            main_signer: id_signers,
            urutan,
            currentSigner, 
            id_item, 
            id_karyawan, 
            id_logsign, 
            is_delegated,
            delegated_signers: is_delegated ? delegated_signers : null, 
            main_token,
            delegate_token,
            deadline,
            sign_permission,
        });
        
    } catch (error) {
        console.error("Receive document error:", error.message);
        return res.status(403).json({message: 'Invalid or expired token'});
    }
});

router.post('/link-access-log', async (req, res) => {
  const { token, real_email, password, is_accessed, currentSigner } = req.body;
  const jwtSecret = process.env.JWT_SECRET_KEY;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const {
        id_dokumen,
        id_signers,
        urutan, 
        id_item, 
        id_karyawan, 
        is_delegated, 
        delegated_signers
    } = decoded.dokumenLogsign || {};

    if (!id_dokumen || !id_item || !id_karyawan || !urutan || !currentSigner) {
        return res.status(400).json({
            message: 'Missing token data.',
            details: { id_dokumen, id_item, id_karyawan, urutan, currentSigner }
        });
    }

    const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
    const delegatedArray = Array.isArray(delegated_signers) ? delegated_signers : [delegated_signers];

    const isAuthorizedSigner = signerArray.includes(currentSigner) || delegatedArray.includes(currentSigner);

    if (!isAuthorizedSigner) {
        return res.status(403).json({ message: 'Unauthorized signer access' });
    }

    const logsign = await LogSign.findOne({
        where: { 
            id_dokumen,
            [Op.or]: [
                {id_signers: currentSigner}, 
                {delegated_signers: currentSigner}
            ]},
    });

    if (!logsign) {
      return res.status(404).json({ message: `LogSign not found for signer: ${currentSigner}` });
    }

    const userToVerify = await Karyawan.findOne({
        where: { id_karyawan: currentSigner },
        include: [{
            model: User,
            as: 'Penerima',
            attributes: ['email', 'password']
        }]
    });

    if (!userToVerify || !userToVerify.Penerima) {
        return res.status(404).json({ message: "User data not found" });
    }

    const intended_email = userToVerify.Penerima.email;
    const intended_password = userToVerify.Penerima.password;

    const isPasswordValid = await bcrypt.compare(password, intended_password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Incorrect password.' });
    }

    if (real_email !== intended_email) {
        return res.status(403).json({ message: "Unauthorized email" });
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

    res.status(200).json({ message: `Link access recorded for signer: ${currentSigner}` });

  } catch (err) {
    console.error("Error verifying link access log:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});


router.get('/access-status', async(req, res) => {
    const {token} = req.query;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        const decodeRaw = jwt.decode(token);
        
        if (!decodeRaw || !decodeRaw.dokumenLogsign){
            return res.status(400).json({message: "Invalid token payload", is_accessed: false});
        }

        const {
            id_dokumen,
            id_signers,
            urutan, 
            currentSigner,
            id_item, 
            id_karyawan, 
            is_delegated, 
            delegated_signers,
        } = decodeRaw.dokumenLogsign || {};

        const signerId = currentSigner || delegated_signers  || id_signers;

        const logsign = await LogSign.findOne({
            where: {id_dokumen, [!is_delegated ? "id_signers" : "delegated_signers"] : signerId},
            attributes: ['id_logsign', 'id_signers', 'delegated_signers', 'status'],
        });

        if (!logsign) {
            return res.status(404).json({ message: "LogSign not found", is_accessed: false });
        }

        if (logsign.status === "Pending") {
            try {
                jwt.verify(token, jwtSecret);
            } catch (error) {
                 await LogSign.update(
                    {status: "Expired"},
                    {where: {id_logsign: logsign.id_logsign}}
                );

                console.error("Access denied, token expired:", error.message);
                return res.status(403).json({message: "Invalid or expired token", is_accessed: false});
            }
        } else if (logsign.status === "Completed"){
            console.log("Access status bypass expired (Completed)");
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

router.get('/axis-field/:id_dokumen/:id_signers/:id_item', async (req, res) => {
    const { id_dokumen, id_signers, id_item } = req.params;
    try {
        const logsignRecord = await LogSign.findOne({
            where: {
                id_dokumen, 
                [Op.or]: [
                    {id_signers}, 
                    {delegated_signers: id_signers}
                ]
            }, 
            attributes: ["id_signers", "delegated_signers", "is_delegated", "main_token", "delegate_token", "sign_permission"]
        });

        // console.log("LOGSIGN RECORD AXIS FIELD:", logsignRecord);

        const mainSignerId = logsignRecord.id_signers;


        const response = await LogSign.findAll({
            where: { id_dokumen, id_signers: mainSignerId, id_item },
            attributes: ["id_item", "id_signers", "status", "urutan", "is_submitted", "is_delegated", "main_token", "delegate_token", "sign_permission", "tgl_tt" ],
            include: [
                {
                    model: Item,
                    as: "ItemField",
                    attributes: ["jenis_item", "x_axis", "y_axis", "width", "height", "id_item", "page"]
                },
                {
                    model: Karyawan,
                    as: "Signerr",
                    attributes: ["nama"]
                }
            ]
        });

        // console.log("RESPONSE:", JSON.stringify(response, null, 2));
        const pages = response.map(r => r?.ItemField?.page);
        // console.log("PAGES:", pages);

        res.status(200).json(response);
        // res.status(200).json({ pages });
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
            attributes: ["id_signers", "delegated_signers", "id_dokumen", "createdAt", "tgl_tt"],
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

router.get('/doc-info/:id_dokumen/:finalSignerId', async(req, res) => {
    const {id_dokumen, finalSignerId} = req.params;

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, [Op.or] : [
                {id_signers: finalSignerId},
                {delegated_signers: finalSignerId}
            ]}, 
            attributes: ["id_logsign","id_signers", "delegated_signers", "id_dokumen", "createdAt", "id_karyawan", "status", "tgl_tt", "is_submitted"],
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
                    attributes: ['accessed_at', 'real_email', 'id_logsign'], 
                    where: {
                        id_karyawan: finalSignerId
                    },
                    required: false
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


//get real audit trail
router.get('/audit-info/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;

    try {
        const signerData = await LogSign.findOne({
            where: {id_dokumen, id_signers},
            attributes: ["delegated_signers"]
        });

        const delegatedSignerId = signerData?.delegated_signers || null;

        const response = await LogSign.findAll({
            where: {id_dokumen, 
                [Op.or]: [
                {id_signers}, 
                delegatedSignerId ? { id_signers : delegatedSignerId } : {}
            ]}, 
            attributes: ["id_logsign","id_signers", "delegated_signers", "id_dokumen", "createdAt", "id_karyawan", "status", "tgl_tt", "is_submitted", "sign_permission"],
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
                    attributes: ['accessed_at', 'real_email', 'id_logsign'], 
                    where: 
                        delegatedSignerId 
                        ? { id_karyawan: [id_signers, delegatedSignerId] }
                        : { id_karyawan: id_signers},
                        required: false
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
        res.status(200).json(response);
    } catch (error) {
        console.log("error:", error.message);
    }
});

router.get('/initials/:id_dokumen/:id_signers', async(req, res) => {
    const {id_dokumen, id_signers} = req.params;
    const idSignerList = id_signers.split(',');

    try {
        const response = await LogSign.findAll({
            where: {id_dokumen, id_signers: idSignerList},
            attributes: ["sign_base64", "status", "id_item", "id_signers", "delegated_signers"],
            include: [
                {
                    model: Karyawan,
                    as: "Signerr",
                    attributes: ["nama"],
                }
            ]
        }); 
        res.status(200).json(response);
        
    } catch (error) {
        console.error("Failed to get imgBase64", error.message);
    }
});

router.patch('/update-submitted/:id_dokumen/:currentSigner', async(req, res) => {
    const {id_dokumen, currentSigner} = req.params;
    const {is_submitted, status, tgl_tt} = req.body;


    try {
        const submitted = await LogSign.update(
            {is_submitted, status, tgl_tt},
            {
                where: {
                    id_dokumen,
                    [Op.or]: [
                        {id_signers: currentSigner},
                        {delegated_signers: currentSigner}
                    ]},
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
    const currentTime = new Date();


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
        const receiverName = await Karyawan.findOne({where: {id_karyawan: signerID}});

        const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: receiverEmail,
        subject: `Declined document: ${documentName}`,
        text: `The Document was declined. \n
            ${receiverName?.nama || "Signer"} was declined to sign this document.\n
            As a result, the documents can not be completed for the following reasons: ${reason}. \n
            Click link to review the document ${declineLink}\n
            Please do not share this email and the link attached with others.\n\n
            Regards, \n
            Campina Sign.`
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Failed to send decline email:", error.message);
        throw error;
    }
};

router.post('/send-delegate-email', async (req, res) => {
  try {
    const { id_dokumen, delegated_signers, token } = req.body;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    if (!jwtSecret) throw new Error("JWT_SECRET_KEY is not set");

    const decoded = jwt.verify(token, jwtSecret);
    const {
      id_dokumen: docFromToken,
      urutan,
      id_signers,
    } = decoded.dokumenLogsign || {};

    const finalDocId = id_dokumen || docFromToken;
    const delegateList = Array.isArray(delegated_signers)
      ? delegated_signers
      : [delegated_signers];

    let emailResults = [];

    const docName = await LogSign.findOne({
      where: { id_dokumen: finalDocId },
      include: [
        { model: Dokumen, as: "DocName", attributes: ["nama_dokumen"] },
      ],
      attributes: ["id_dokumen"],
    });
    const documentName = docName?.DocName?.nama_dokumen;

    for (const delegateId of delegateList) {
      const row = await LogSign.findOne({
        where: {
          id_dokumen: finalDocId,
          urutan,
          delegated_signers: delegateId,
          status: "Pending",
        },
        attributes: ["id_logsign", "id_signers", "delegated_signers", "urutan", "main_token"],
      });

      if (!row) {
        emailResults.push({
          delegateId,
          message: `LogSign row not found for delegated_signers ${delegateId} urutan ${urutan}`,
        });
        continue;
      }

      const senderInfo = await Karyawan.findOne({
        where: { id_karyawan: row.id_signers },
        include: [{ model: User, as: "Pengirim", attributes: ["email"] }],
        attributes: ["id_karyawan", "nama"],
      });

      const senderName = senderInfo?.nama || "Unknown";

      const receiver = await Karyawan.findOne({
        where: { id_karyawan: delegateId },
        include: [{ model: User, as: "Penerima", attributes: ["email"] }],
        attributes: ["id_karyawan", "nama"],
      });

      const intended_email = receiver?.Penerima?.email;
      const receiverName = receiver?.nama || "Unknown";
      const basePayload = jwt.verify(row.main_token, jwtSecret);

      const newToken = jwt.sign(
        {
          ...basePayload,
          dokumenLogsign: {
            ...basePayload.dokumenLogsign,
            delegated_signers: delegateId,
            urutan: row.urutan,
            currentSigner: delegateId,
            is_delegated: true,
            intended_email,
            // id_signers: row.id_signers,
            id_signers
          },
        },
        jwtSecret
      );

      const delegateLink = `http://localhost:3000/user/envelope?token=${newToken}`;

      await sendEmailDelegateInternal(
        delegateLink,
        documentName,
        receiverName,
        intended_email,
        senderName
      );

      await LogSign.update(
        { delegate_token: newToken },
        { where: { id_logsign: row.id_logsign } }
      );

      emailResults.push({
        delegateId,
        urutan: row.urutan,
        id_signers: row.id_signers,
        message: "Delegate email sent successfully.",
      });
    }

    res.status(200).json({
      message: "Delegate email processed.",
      results: emailResults,
    });
  } catch (error) {
    console.log("Failed to send delegate email:", error.message);
    res.status(500).json({ message: "Failed to send delegate email." });
  }
});


const sendEmailDelegateInternal = async(delegateLink, documentName, receiverName, receiverEmail, senderName) => {
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
        text: `${receiverName || "Signer"}, You are delegated to sign a document ${documentName} from ${senderName}.\n
          Please review and check the document before signing it.\n
          Click link to sign the document ${delegateLink}\n\n
          Please do not share this email and the link attached with others.\n
          Regards, \n
          Campina Sign.`
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Failed to send delegate email:", error.message);
        throw error;
    }
}

// samakan dengan send-delegate
router.post('/signed-delegate-email', async(req, res) => {
    try {
        const {id_dokumen, token, delegated_signers} = req.body;

        let emailResults = [];

        const signedDelegateLink = `http://localhost:3000/user/envelope?token=${token}`;

        const mainSigner = await LogSign.findOne({
            where: {id_dokumen, delegated_signers: delegated_signers}
        });

        if (!mainSigner) {
            return res.status(404).json({ message: "Main signer not found for this delegate." });
        }

        const mainSignerID = mainSigner.id_signers;

        const docName = await LogSign.findOne({
            where: {id_dokumen}, 
            include: [{
                model: Dokumen, 
                as: "DocName",
                attributes: ["nama_dokumen"]
            }], 
            attributes: ["id_dokumen"]
        });

        const documentName = docName?.DocName?.nama_dokumen;

        await sendEmailSignedDelegate(signedDelegateLink, id_dokumen, documentName, mainSignerID, delegated_signers);
        emailResults.push({mainSignerID, message: 'Signed delegate email sent successfully.'});

        res.status(200).json({
            message: 'Signed delegate email processed.',
            results: emailResults,
        });
    } catch (error) {
        console.error("Failed to send signed delegate email:", error.message);
        res.status(500).json({ message: "Failed to send signed delegate email." });
    }
});

const sendEmailSignedDelegate = async(signedDelegateLink, id_dokumen, documentName, mainSignerID, delegated_signers) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            auth: {
                user: process.env.EMAIL_ADMIN, 
                pass: process.env.EMAIL_PASS_ADMIN, 
            }
        });

        const receiver = await Karyawan.findOne({
            where: {id_karyawan: mainSignerID}, 
            include: [{
                model: User, 
                as: "Penerima", 
                attributes: ["email"]
            }], 
            attributes: ["id_karyawan", "nama"]
        }); 

        if (!receiver?.Penerima?.email) {
            console.warn(`Email not found for signer ${mainSignerID}`);
            return;
        }

        const receiverEmail = receiver.Penerima.email;
        const receiverName = await Karyawan.findOne({where: {id_karyawan: mainSignerID}});

        const delegatedSignerName = await Karyawan.findOne({
            where: {id_karyawan: delegated_signers},
            attributes: ["nama"]
        });

        const delegatedName = delegatedSignerName?.nama || "Delegated Signer";

        const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: receiverEmail,
        subject: `Delegated signed document: ${documentName}`,
        text: `The document was signed by ${delegatedName}. \n
            ${receiverName?.nama || "Signer"}, your document has been signed by ${delegatedName}.\n
            Click link to review the document ${signedDelegateLink}\n
            Please do not share this email and the link attached with others.\n\n
            Regards, \n
            Campina Sign.`
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Failed to send decline email:", error.message);
        throw error;
    }
};

export default router;