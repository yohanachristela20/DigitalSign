import Dokumen from "../models/DokumenModel.js";
import bcrypt from "bcrypt";
import { group } from "console";
import path from "path";
import KategoriDokumen from "../models/KategoriDokModel.js";
import LogSign from "../models/LogSignModel.js";
import Sign from "../models/SignModel.js";
import fs, { stat } from 'fs';
import db from "../config/database.js";
import { sign } from "crypto";
import Item from "../models/ItemModel.js";

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

// export const createLogSign = async (req,res) => {
//     const transaction = await db.transaction();
//     try {
//     const {logsigns} = req.body;

//     if (!Array.isArray(logsigns) || logsigns.length === 0) {
//         return res.status(400).json({message: "logsign must be a non-empty array."});
//     }

//     const lastRecord = await LogSign.findOne({
//         order: [['id_logsign', 'DESC']],
//         transaction,
//         lock: transaction.LOCK.UPDATE,
//     });

//     let lastIdNumber = lastRecord ? parseInt(lastRecord.id_logsign.substring(2), 10) : 0;
//     const newLogSign = [];

//     for (const log of logsigns) {
//         const items = Array.isArray(log.id_item) ? log.id_item : [log.id_item];

//         for (const item of items) {
//             lastIdNumber += 1;
//             const newIdNumber = lastIdNumber.toString().padStart(5, '0');
//             newLogSign.push({
//                 id_logsign: `LS${newIdNumber}`, 
//                 action: log.action, 
//                 status: log.status,
//                 id_dokumen: log.id_dokumen,
//                 id_karyawan: log.id_karyawan, 
//                 id_signers: log.id_signers, 
//                 id_item: log.id_item, 
//             }); 
//         }
//     }

//     await LogSign.bulkCreate(newLogSign, {transaction});

//     const lastSign = await Sign.findOne({
//         order: [['id_sign', 'DESC']],
//         transaction,
//         lock: transaction.LOCK.UPDATE,
//     });

//     let lastSignNumber = lastSign ? parseInt(lastSign.id_sign.substring(2), 10) : 0;

//     const newSigns = newLogSign.map(log => ({

//         id_logsign: log.id_logsign,
//     }));

//     lastSignNumber += 1;
//     const newSignNumber = lastSignNumber.toString().padStart(5, '0');

//     await Sign.bulkCreate(newSigns, {transaction});

//     await transaction.commit();
//     res.status(201).json({
//         msg: "New logsigns have been created!",
//         data: {logsigns: newLogSign},
//     });
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Error when creating logsigns: ", error);
//         res.status(500).json({message: error.message});
//     }
// };

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
    res.status(201).json({
      msg: "New logsigns and signs have been created!",
      data: { logsigns: newLogSign },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error when creating logsigns: ", error);
    res.status(500).json({ message: error.message });
  }
};


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
