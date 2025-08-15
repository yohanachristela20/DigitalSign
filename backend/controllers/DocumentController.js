import Dokumen from "../models/DokumenModel.js";
import path from "path";
import KategoriDokumen from "../models/KategoriDokModel.js";
import LogSign from "../models/LogSignModel.js";
import Sign from "../models/SignModel.js";
import fs, { stat } from 'fs';
import db from "../config/database.js";
import Item from "../models/ItemModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Karyawan from "../models/KaryawanModel.js";
import User from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import { log } from "console";
import { Op } from "sequelize";
// import  { sendEmailToSigner } from "../helpers/sendEmailHelper.js";
import sendEmailToSigner from "../helpers/sendEmailHelper.js";

dotenv.config();

export const getDocument = async(req, res) => {
    try {
        const response = await Dokumen.findAll({
            include: [
                {
                    model: KategoriDokumen,
                    as: "Kategori",
                    attributes: ["id_kategoridok", "kategori"],
                },
            ],
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const getDocumentById = async(req, res) => {
    try {
        const response = await Dokumen.findOne({
            where:{
                id_dokumen: req.params.id_dokumen 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getDocumentByCategory = async(req, res) => {
    const {id_kategoridok} = req.params;
    try {
        const response = await Dokumen.findAll({
            where: {id_kategoridok: id_kategoridok},
            attributes: ["id_dokumen", "nama_dokumen", "id_kategoridok", "createdAt"],
             include: [
                {
                    model: KategoriDokumen,
                    as: "Kategori",
                    attributes: ["id_kategoridok", "kategori"],
                },
            ],
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const createDocument = async(req, res) => {
    const transaction = await db.transaction();
    try {
        if(!req.file) {
            return res.status(400).json({message: "PDF file is required"})
        }
        const {
            id_dokumen,
            nama_dokumen, 
            id_kategoridok,
            action, 
            status, 
            id_karyawan,
        } = req.body;
        const filePath = path.join("uploads/files", req.file.filename);

        const newDocument = await Dokumen.create({
            id_dokumen,
            nama_dokumen,
            id_kategoridok,
            filepath_dokumen: filePath,
        }, {transaction});

        await transaction.commit();
        res.status(201).json({msg: "New Document has been created!", filePath, 
            data: {
                document: newDocument,
            }
        }); 
    } catch (error) {
        await transaction.rollback();
        console.error("Error when upload document:", error);
        res.status(500).json({message: error.message}); 
    }
}

export const createLogSign = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { logsigns } = req.body;

    if (!Array.isArray(logsigns) || logsigns.length === 0) {
      return res.status(400).json({ message: "logsign must be a non-empty array." });
    }

    const lastRecord = await LogSign.findOne({
      order: [["id_logsign", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    let lastIdNumber = lastRecord ? parseInt(lastRecord.id_logsign.substring(2), 10) : 0;
    const newLogSign = [];

    for (const log of logsigns) {
      const items = Array.isArray(log.id_item) ? log.id_item : [log.id_item];
      for (const item of items) {
        lastIdNumber += 1;
        const newIdNumber = lastIdNumber.toString().padStart(5, "0");

        newLogSign.push({
          id_logsign: `LS${newIdNumber}`,
          action: log.action,
          status: log.status,
          id_dokumen: log.id_dokumen,
          id_karyawan: log.id_karyawan,
          id_signers: log.id_signers,
          id_item: item,
          urutan: parseInt(log.urutan),
        });
      }
    }

    await LogSign.bulkCreate(newLogSign, { transaction });

    const lastSign = await Sign.findOne({
        order: [['id_sign', 'DESC']],
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    let lastSignNumber = lastSign ? parseInt(lastSign.id_sign.substring(5), 10) : 0;

    const newSigns = newLogSign.map(log => {
        lastSignNumber += 1;
        const newSignNumber = lastSignNumber.toString().padStart(5, '0');
        return {
            id_sign: `SN${newSignNumber}`,
            id_logsign: log.id_logsign,
        };
    });

    await Sign.bulkCreate(newSigns, { transaction});
    await transaction.commit();

    const subjectt = [...new Set(logsigns.map(log => log.subject).filter(Boolean))];
    const messagee = [...new Set(logsigns.map(log => log.message).filter(Boolean))];
   
    res.status(201).json({
      msg: "New logsigns and signs have been created!",
      data: { logsigns: newLogSign, subjectt, messagee },
    });
  } catch (error) {
    console.error("Error when creating logsigns: ", error);
    res.status(500).json({ message: error.message });
  }
};

const sendEmailNotificationInternal = async (validLogsigns, signLink, subjectt, messagee, documentName) => {
    console.log("Logsigns:", validLogsigns);
    console.log("Signlink:", signLink);
    console.log("Subjectt:", subjectt);
    console.log("Messagee:", messagee);
    console.log("Document name:", documentName);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS_ADMIN,
      }
    });

    if (validLogsigns.length === 0) return;

    const log = validLogsigns[0];

    const existingLog = await LogSign.findOne({
      where: {id_logsign: log.id_logsign},
    });

    if (!existingLog) {
      console.warn(`Logsign ${log.id_logsign} already deleted, skipping email.`);
      return;
    }

    const receiver = await Karyawan.findOne({
      where: {id_karyawan: log.id_signers},
      include: [{
        model: User,
        as: "Penerima", 
        attributes: ["email"]
      }],
      attributes: ["id_karyawan"]
    }); 

    if (!receiver?.Penerima?.email) {
      console.warn(`Email not found for signer ${log.id_signers}`);
      return;
    }

    const receiverEmail = receiver.Penerima.email;
    const senderName = await Karyawan.findOne({where: {id_karyawan: log.id_karyawan}});
    const receiverName = await Karyawan.findOne({where: {id_karyawan: log.id_signers}});

    const mailOptions = {
      from: process.env.EMAIL_ADMIN,
      to: receiverEmail,
      subject: subjectt.join(', ') || `You need to sign ${documentName}`,
      text: `${receiverName?.nama || "Signer"}, You are requested to sign a document ${documentName} from ${senderName?.nama || "Sender"}.\n
          ${messagee.join(', ') || "Please review and check the document before signing it."}\n
          Click link to sign the document ${signLink}\n\n
          Please do not share this email and the link attached with others.\n
          Regards, \n
          Campina Sign.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${receiverEmail} for signer ${log.id_signers}`);

  } catch (err) {
    console.error("Email sending error:", err.message);
    throw err;
  }
};


// CEK GENERATE LINK 
export const sendEmailNotification = async (req, res) => {
  try {
    const {subjectt, messagee, id_dokumen, id_signers, urutan, id_item, id_karyawan, delegated_signers, day_after_reminder} = req.body;
    const jwtSecret = process.env.JWT_SECRET_KEY;

    console.log("day after reminder:", day_after_reminder);

    const signerList = [...new Set(Array.isArray(id_signers) ? id_signers : [id_signers])];
    const urutanList = [...new Set(Array.isArray(urutan) ? urutan : [urutan])];
    const itemList = [...new Set(Array.isArray(id_item) ? id_item : [id_item])];
    const senderList = [...new Set(Array.isArray(id_karyawan) ? id_karyawan : [id_karyawan])];
    const delegateList = [...new Set(Array.isArray(delegated_signers) ? delegated_signers : [delegated_signers])];

    let emailResults = [];

    for (const signer of signerList) {
      const validLogsigns = await LogSign.findAll({
        where: {
          id_signers: signer,
          id_dokumen,
          status: 'Pending',
        },
        include: [{
          model: Karyawan,
          as: 'Signerr',
          include: [{
            model: User,
            as: 'Penerima',
            attributes: ['email']
          }],
        }]
      });

      console.log(`Valid logsigns for ${signer}:`, validLogsigns.map(log => log.toJSON()));

      if (validLogsigns.length === 0) {
        emailResults.push({ signer, message: 'No valid logsigns to notify.' });
        continue;
      }

      const intended_email = validLogsigns[0].Signerr?.Penerima?.email;
      const token = jwt.sign({dokumenLogsign: {id_dokumen, id_signers: signerList, urutan: urutanList, currentSigner: signer, id_item: itemList, id_karyawan: senderList, intended_email, delegated_signers: delegateList}}, jwtSecret);
      const signLink = `http://localhost:3000/user/envelope?token=${token}`;

      await LogSign.update(
        { token },
        { where: { id_signers: signer, id_dokumen, status: 'Pending' }}
      )

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
      console.log("DOC NAME:", documentName);

      await sendEmailNotificationInternal(validLogsigns, signLink, subjectt, messagee, documentName);
      
      if (day_after_reminder && !isNaN(day_after_reminder)) {
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + Number(day_after_reminder));

        await LogSign.update(
          { reminder_date: reminderDate},
          { where: {id_signers: signer, id_dokumen, status: 'Pending'}}
        )

        // for (const log of validLogsigns) {
        //   await sendEmailToSigner(log, subjectt, messagee);
        // }
      }

      emailResults.push({ signer, message: 'Email sent.' });
    }

    res.status(200).json({
      message: 'Emails processed.',
      results: emailResults,
    });

  } catch (error) {
    console.error("Failed to send email notification:", error.message);
    res.status(500).json({ message: "Failed to send email notification." });
  }
};

// export const sendEmailNotification = async (req, res) => {
//   try {
//     const {subjectt, messagee, id_dokumen, id_signers, urutan, id_item, id_karyawan, delegated_signers, day_after_reminder} = req.body;
//     // const jwtSecret = process.env.JWT_SECRET_KEY;

//     console.log("day after reminder:", day_after_reminder);

//     const signerList = Array.isArray(id_signers) ? id_signers : [id_signers];

//     let emailResults = [];

//     for (const signer of signerList) {
//       const validLogsigns = await LogSign.findAll({
//         where: {
//           id_signers: signer,
//           id_dokumen,
//           status: 'Pending',
//         },
//         include: [{
//           model: Karyawan,
//           as: 'Signerr',
//           include: [{
//             model: User,
//             as: 'Penerima',
//             attributes: ['email']
//           }],
//         }, 
//         {
//           model: Dokumen, 
//           as: "DocName", 
//           attributes: ["nama_dokumen"],
//         }]
//       });

//       for (const log of validLogsigns) {
//         await sendEmailToSigner(log, subjectt, messagee);
//       }

//       if (day_after_reminder && !isNaN(day_after_reminder)) {
//         const reminderDate = new Date();
//         reminderDate.setDate(reminderDate.getDate() + Number(day_after_reminder));

//         await LogSign.update(
//           { reminder_date: reminderDate},
//           { where: {id_signers: signer, id_dokumen, status: 'Pending'}}
//         )
//       }

//       // emailResults.push({ signer, message: 'Email sent.' });
//     }

//     res.status(200).json({
//       message: 'Emails processed.',
//       // results: emailResults,
//     });

//   } catch (error) {
//     console.error("Failed to send email notification:", error.message);
//     res.status(500).json({ message: "Failed to send email notification." });
//   }
// };

export const getSignLink = async (req, res) => {
  try {
    const { id_dokumen } = req.params;

    const jwtSecret = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ dokumenLogsign: [id_dokumen] }, jwtSecret);

    const signLink = `http://localhost:3000/user/envelope?token=${token}`;
    res.status(200).json({ signLink });
  } catch (error) {
    console.error("Failed to generate signLink:", error.message);
    res.status(500).json({ message: "Failed to generate signLink" });
  }
};


export const updateReminder = async(req,res) => {
    const {id_dokumen} = req.params;
    const {is_deadline, is_download, day_after_reminder, repeat_freq, deadline} = req.body;

    try {
        const result = await LogSign.update(
      {
        is_deadline,
        is_download,
        day_after_reminder,
        repeat_freq,
        deadline
      },
      {
        where: { id_dokumen },
      }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "No log_sign records found to update." });
    }
    res.status(200).json({msg: "Reminder updated successfully."})
    } catch (error) {
        console.error("Failed to update reminder:", error.message);
        res.status(500).json({message: error.message});
    }
};

export const updateInitialSign = async(req, res) => {
  const {id_dokumen, id_item, id_signers} = req.params;
  const {sign_base64, status, tgl_tt} = req.body;

  try {
    const logsign = await LogSign.findOne({
      where: { id_dokumen, id_item, id_signers}, 
      include: {
        model: Item,
        as: "ItemField"
      }
    });

    if (!logsign) {
      return res.status(404).json({ message: "Logsign not found" });
    }

    const jenis_item = logsign.ItemField?.jenis_item;
    const currentUrutan = logsign.urutan;

    if (!jenis_item || !currentUrutan) {
      return res.status(400).json({message: "Missing jenis item or urutan"});
    }

    console.log("Jenis item:", jenis_item);
    console.log("Current urutan:", currentUrutan);

    let finalSignBase64 = sign_base64;
    const prevUrutan = currentUrutan - 1;

    if (prevUrutan > 1) {
      const prevLog = await LogSign.findOne({
        where: {
          id_dokumen,
          urutan: prevUrutan,
        }, 
        include: {
          model: Item,
          as: "ItemField", 
        }, 
      });

      if (prevLog) {
        const prevJenisItem = prevLog.ItemField?.jenis_item;

        if (prevJenisItem === jenis_item && prevLog.id_signers === id_signers) {
          finalSignBase64 = prevLog.sign_base64;
        }
      }
    }

    const relatedLogs = await LogSign.findAll({
      where: {
        id_dokumen: id_dokumen,
        id_signers: id_signers
      },
      include: {
        model: Item, 
        as: "ItemField",
        where: { jenis_item: jenis_item }
      }
    });

    for (const log of relatedLogs) {
      await log.update({sign_base64: finalSignBase64, status, tgl_tt});
    }

    res.status(200).json({msg: `${relatedLogs.length} InitialSign saved successful in Logsign.`});

  } catch (error) {
    console.log("Failed to save InitialSign:", error.message);
    res.status(500).json({ message: error.message });
  }
}

export const deleteLogsign = async(req, res) => {
    const transaction = await db.transaction();
    const {id_dokumen, id_item, id_signers} = req.params;
    try {
        const logsign = await LogSign.findOne({
          where: {id_dokumen, id_item, id_signers}
        });

        if (!logsign) {
          await transaction.rollback();
          return res.status(404).json({ message: "Logsign not found" });
        }

        const deletedUrutan = parseInt(logsign.urutan);

        await Sign.destroy({
            where: {id_logsign: logsign.id_logsign},
            transaction
        });
            
        await LogSign.destroy({
            where: {id_dokumen, id_item, id_signers},
            transaction
        });

        await LogSign.update(
          {urutan: db.literal('urutan - 1')},
          {
            where: {
              id_dokumen,
              urutan: { [Op.gt] : deletedUrutan },
            },
            transaction,
          }
        );

        await transaction.commit();
        res.status(200).json({message: "Logsign deleted successfully."});
    } catch (error) {
        await transaction.rollback();
        console.error("Failed to delete logsign by id_signers", error)
        res.status(500).json({message: error.message});
    }
};

export const deleteSign = async(req, res) => {
  const {id_logsign} = req.params;

  try {
    const sign = await Sign.findOne({
      where: {id_logsign}
    });

    if (!sign) {
        return res.status(404).json({ message: "Sign data not found" });
    }

    await Sign.destroy({
        where: {id_logsign},
    });

     await LogSign.destroy({
      where: { id_logsign },
    });
    res.status(200).json({message: "Sign deleted successfullly."});
  } catch (error) {
        console.error("Failed to delete sign by id_logsign", error)
        res.status(500).json({message: error.message});
  }
}



export const createItem = async(req, res) => {
    const transaction = await db.transaction();

    try {
        const items = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No item data provided." });
        }

        const lastRecord = await Item.findOne({
            order: [['id_item', 'DESC']],
            transaction,
        });

        let lastIdNumber = lastRecord ? parseInt(lastRecord.id_item.substring(2), 10) : 0;

        const formattedItems = items.map((item, index) => {
            const newIdNumber  = (lastIdNumber + index + 1).toString().padStart(5, '0');
            return {
                id_item: `F${newIdNumber}`,
                jenis_item: item.jenis_item,
                x_axis: item.x_axis,
                y_axis: item.y_axis, 
                width: item.width,
                height: item.height,

            };
        })

        await Item.bulkCreate(formattedItems, {transaction});

        await transaction.commit();
        res.status(201).json({
            msg: "New item has been created!",
            data: {items: formattedItems},
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error when creating item: ", error);
        res.status(500).json({message: error.message});
    }
};

export const updateDocument = async(req, res) => {
    try {
        await Dokumen.update(req.body, {
            where:{
                id_dokumen: req.params.id_dokumen
            }
        });
        res.status(200).json({msg: "Document was updated successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const deleteDocument = async(req, res) => {
    try {
        const document = await Dokumen.findOne({
            where:{
                id_dokumen: req.params.id_dokumen
            }
        });

        if (!document){
            return res.status(404).json({msg: "Document not found"});
        }

        if(document.filepath_dokumen) {
            const filePath = path.resolve(document.filepath_dokumen);

            try {
                await fs.promises.unlink(filePath);
                console.log("Document was deleted successfully.", filePath);
            } catch (error) {
                console.error("Failed to delete document", error.message)
            }
        }

        await Dokumen.destroy(
            {
                where:{
                    id_dokumen: req.params.id_dokumen
                }
            }
        );

        res.status(200).json({msg: "Document was deleted successfully."}); 
    } catch (error) {
        console.error("Failed to delete document:", error.message);
        return res.status(500).json({message: "Failed to delete document."});
    }
}

export const getLastDocumentId = async (req, res) => {
    try {
        const lastRecord = await Dokumen.findOne({
            order: [['id_dokumen', 'DESC']],
        });

        if (lastRecord) {
            return res.status(200).json({ lastId: lastRecord.id_dokumen });
        }
        return res.status(200).json({ lastId: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving last document ID.' });
    }
}; 
