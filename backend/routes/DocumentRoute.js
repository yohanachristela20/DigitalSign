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
        // deleteSign, 
        deleteLogsign, 
        updateReminder,
        sendEmailNotification,
        getSignLink,
        updateInitialSign,
        temporaryDelete,
        restoreDocument,
        autoDeleteDocument,
        getTrash,
        getTrashByCategory,
        getLogsignByDocId,
        updateLogsign,
        // updateItem,
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
router.get('/get-trash', getTrash); 
router.get('/document/category/:id_kategoridok', getDocumentByCategory);
router.get('/trash/category/:id_kategoridok', getTrashByCategory);
router.get('/document/:id_dokumen', getDocumentById);
// router.post('/document', createDocument);  
router.patch('/document/:id_dokumen', updateDocument);
router.delete('/document/:id_dokumen', deleteDocument);
router.get('/getLastDocumentId', getLastDocumentId);
router.post("/document", upload.single("pdf-file"), createDocument);
router.post('/logsign', createLogSign);
router.post('/item', createItem);
// router.patch('/item', updateItem);
// router.delete('/delete-sign/:id_logsign', deleteSign);
router.delete('/logsign/:id_dokumen/:id_item/:id_signers', deleteLogsign);
// router.delete('/delete-signer/:id_signers', deleteSigner);

router.patch('/update-reminder/:id_dokumen', updateReminder);
router.post('/send-email', sendEmailNotification);
router.get("/logsign-link/:id_dokumen", getSignLink);

router.patch('/initialsign/:id_dokumen/:id_item/:id_signers', updateInitialSign);
router.patch('/temporary-del/:id_dokumen', temporaryDelete);
router.patch('/restore-doc/:id_dokumen', restoreDocument);
router.delete('/auto-delete', autoDeleteDocument);
router.get('/logsign/document/:id_dokumen', getLogsignByDocId);
router.patch('/logsign/:id_dokumen/:id_signers', updateLogsign);

// router.get('/document-status', async (req, res) => {
//     const statusList = await LogSign.findAll({
//         attributes: ['id_dokumen', 'status'],
//         group: ['id_dokumen'],
//         include: [
//             {
//                 model: Document,
//                 as: 'Dokumen',
//                 attributes: ['nama_dokumen']
//             }
//         ]
//     });
//     res.json(statusList);
// });


// router.get('/document-status', async (req, res) => {
//     try {
//         const statusList = await LogSign.findAll({
//             attributes: ['id_dokumen', 'status', 'is_submitted'],
//             group: ['id_dokumen'],
//             include: [
//                 {
//                     model: Document,
//                     as: 'Dokumen',
//                     attributes: ['nama_dokumen']
//                 }
//             ],
//             raw: true
//         });

//         const docStatusMap = {};

//         statusList.forEach((log) => {
//             const id_dokumen = log.id_dokumen;
//             if(!docStatusMap[id_dokumen]) {
//                 docStatusMap[id_dokumen] = {
//                     id_dokumen, 
//                     nama_dokumen: log['Dokumen.nama_dokumen'],
//                     statuses: [],
//                     submittedFlags: []
//                 }; 
//             }
//                 docStatusMap[id_dokumen].statuses.push(log.status);  
//                 docStatusMap[id_dokumen].submittedFlags.push(log.is_submitted);
//             });

//             const results = Object.values(docStatusMap).map((doc) => {
//                 const statuses = doc.statuses;
//                 const submittedFlags = doc.submittedFlags;

//                 const allCompleted = statuses.every((s) => s === 'Completed');
//                 const allSubmitted = submittedFlags.some((sub) => sub === true)
//                 // const anyNotSubmitted = doc.submittedFlags.some((sub) => sub === false);
//                 const anyDecline = statuses.includes('Decline');
//                 // const anyNotCompleted = doc.statuses.some((s) => s !== 'Completed');
//                 let finalStatus;

//                 if (anyDecline) {
//                     finalStatus = 'Decline';
//                 } else if (allCompleted && allSubmitted) {
//                     finalStatus = 'Completed';
//                 } else {
//                     finalStatus = 'Pending';
//                 }

//                 return {
//                     id_dokumen: doc.id_dokumen,
//                     nama_dokumen: doc.nama_dokumen,
//                     status: finalStatus
//                 };
//             });
//             res.json(results);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({message: "Error fetching document status."});
//     }
// });

// router.get('/document-status', async (req, res) => {
//     try {
//         const statusList = await LogSign.findAll({
//             attributes: ['id_dokumen', 'status', 'is_submitted'],
//             group: ['id_dokumen'],
//             include: [
//                 {
//                     model: Document,
//                     as: 'Dokumen',
//                     attributes: ['nama_dokumen']
//                 }
//             ],
//             raw: true
//         });

//         const docStatusMap = {};

//         statusList.forEach((log) => {
//             const id_dokumen = log.id_dokumen;
//             if (!docStatusMap[id_dokumen]) {
//                 docStatusMap[id_dokumen] = {
//                     id_dokumen,
//                     nama_dokumen: log['Dokumen.nama_dokumen'],
//                     statuses: [],
//                     // submittedFlags: [],
//                     is_submitted
//                 };
//             }
//             docStatusMap[id_dokumen].statuses.push(log.status);
//             // docStatusMap[id_dokumen].submittedFlags.push(log.is_submitted);
//         });

//         const results = Object.values(docStatusMap).map((doc) => {
//             const statuses = doc.statuses;
//             // const submittedFlags = doc.submittedFlags;

//             const anyDecline = statuses.includes('Decline');
//             const allCompleted = statuses.every((s) => s === 'Completed');
//             // const allSubmitted = submittedFlags.every((sub) => sub === true);

//             let finalStatus;

//             if (anyDecline) {
//                 finalStatus = 'Decline';
//             } else if (allCompleted) {
//                 finalStatus = 'Completed';
//             } else {
//                 finalStatus = 'Pending';
//             }

//             return {
//                 id_dokumen: doc.id_dokumen,
//                 nama_dokumen: doc.nama_dokumen,
//                 status: finalStatus, 
//                 is_submitted: doc.is_submitted,
//             };
//         });

//         res.json(results);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching document status." });
//     }
// });

// router.get('/document-status', async (req, res) => {
//     try {
//         const statusList = await LogSign.findAll({
//             attributes: ['id_dokumen', 'status', 'is_submitted'],
//             include: [
//                 {
//                     model: Document,
//                     as: 'Dokumen',
//                     attributes: ['nama_dokumen']
//                 }
//             ],
//             raw: true
//         });

//         const docStatusMap = {};

//         statusList.forEach((log) => {
//             const id_dokumen = log.id_dokumen;
//             if (!docStatusMap[id_dokumen]) {
//                 docStatusMap[id_dokumen] = {
//                     id_dokumen,
//                     nama_dokumen: log['Dokumen.nama_dokumen'],
//                     statuses: [],
//                     submissions: []   
//                 };
//             }
//             docStatusMap[id_dokumen].statuses.push(log.status);
//             docStatusMap[id_dokumen].submissions.push(log.is_submitted);
//         });

//         const results = Object.values(docStatusMap).map((doc) => {
//             const statuses = doc.statuses;

//             const anyDecline = statuses.includes('Decline');
//             const allCompleted = statuses.every((s) => s === 'Completed');

//             let finalStatus;
//             if (anyDecline) {
//                 finalStatus = 'Decline';
//             } else if (allCompleted) {
//                 finalStatus = 'Completed';
//             } else {
//                 finalStatus = 'Pending';
//             }

//             return {
//                 id_dokumen: doc.id_dokumen,
//                 nama_dokumen: doc.nama_dokumen,
//                 status: finalStatus,
//                 is_submitted: doc.submissions   
//             };
//         });

//         res.json(results);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching document status." });
//     }
// });


router.get('/document-status', async (req, res) => {
  try {
    const statusList = await LogSign.findAll({
      attributes: ['id_dokumen', 'status', 'is_submitted'],
      include: [
        {
          model: Document,
          as: 'Dokumen',
          attributes: ['nama_dokumen']
        }
      ],
      raw: true
    });

    const docStatusMap = {};

    statusList.forEach((log) => {
      const id_dokumen = log.id_dokumen;
      if (!docStatusMap[id_dokumen]) {
        docStatusMap[id_dokumen] = {
          id_dokumen,
          nama_dokumen: log['Dokumen.nama_dokumen'],
          statuses: [],
          submissions: []
        };
      }
      docStatusMap[id_dokumen].statuses.push(log.status);
      docStatusMap[id_dokumen].submissions.push(log.is_submitted);
    });

    const results = Object.values(docStatusMap).map((doc) => {
      const statuses = doc.statuses;
      const submissions = doc.submissions;
      console.log("SUBMISSION:", doc.id_dokumen, submissions);

      const anyDecline = statuses.includes('Decline');
      const allCompleted = statuses.every((s) => s === 'Completed');
      const allSubmitted = submissions.every((s) => s === true);

      let finalStatus;
      if (anyDecline) {
        finalStatus = 'Decline';
      } else if (allCompleted) {
        finalStatus = 'Completed';
      } else if (allCompleted && !allSubmitted) {
        finalStatus = 'Pending';
      } else {
        finalStatus = 'Pending';
      }

      return {
        id_dokumen: doc.id_dokumen,
        nama_dokumen: doc.nama_dokumen,
        status: finalStatus,
        progress: `${statuses.filter(s => s === "Completed").length}/${statuses.length}`,
        submissions
      };
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching document status." });
  }
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