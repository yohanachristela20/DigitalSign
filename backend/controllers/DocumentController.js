import Dokumen from "../models/DokumenModel.js";
import bcrypt from "bcrypt";
import { group } from "console";
import path from "path";
import KategoriDokumen from "../models/KategoriDokModel.js";
import LogSign from "../models/LogSignModel.js";
import fs from 'fs';
import db from "../config/database.js";
import { sign } from "crypto";
import Item from "../models/ItemModel.js";

// export const getDocument = async(req, res) => {
//     try {
//         const response = await Dokumen.findAll({
//             attributes: ['id_kategoridok', 'kategori'],
//             order: [['id_kategoridok', 'ASC']]
//         });
//         res.status(200).json(response); 
//     } catch (error) {
//         console.log(error.message); 
//         res.status(500).json({ message: "Failed to fetch categories" });
//     }
// }

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
            // group: ["Kategori.id_kategoridok"],
        });
        // console.log("Document by category: ", response);
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}



// export const createDocument = async(req, res) => {
//     try {
//         if(!req.file) {
//             return res.status(400).json({message: "PDF file is required"})
//         }
//         const {id_dokumen, nama_dokumen, id_kategoridok} = req.body;
//         const filePath = path.join("uploads/files", req.file.filename);

//         await Dokumen.create({
//             id_dokumen,
//             nama_dokumen,
//             id_kategoridok,
//             filepath_dokumen: filePath,
//         });
//         console.log(req.body);
//         // await Dokumen.create(req.body);
//         res.status(201).json({msg: "New Document has been created!", filePath}); 
//     } catch (error) {
//         res.status(500).json({message: error.message}); 
//     }
// }

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
        // console.log(req.body);

        // const newLogSign = await LogSign.create(
        //     {
        //         action: "Created", 
        //         status: "Pending",
        //         id_dokumen: newDocument.id_dokumen, 
        //         id_karyawan,
        //     }, 
        //     { transaction }
        // );
        // await Dokumen.create(req.body);

        await transaction.commit();
        res.status(201).json({msg: "New Document has been created!", filePath, 
            data: {
                document: newDocument,
                // logsign: newLogSign,
            }
        }); 
    } catch (error) {
        await transaction.rollback();
        console.error("Error when upload document:", error);
        res.status(500).json({message: error.message}); 
    }
}

// export const createLogSign = async(req, res) => {
//     const transaction = await db.transaction();

//     try {
//         const {
//             action,
//             status,
//             id_dokumen, 
//             id_karyawan,
//             id_signers,
//         } = req.body;

//         const newLogSign = [];

//         newLogSign.push(
//             {
//                 action: "Created",
//                 status: "Pending",
//                 id_dokumen,
//                 id_karyawan,
//                 id_signers
//             }, 
//         );

//         await LogSign.bulkCreate(newLogSign, {transaction});

//         await transaction.commit();
//         res.status(201).json({msg: "New log sign has been created!", 
//             data: {
//                 logsign: newLogSign,
//             }
//         })
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Error when update logsign:", error);
//         res.status(500).json({message: error.message});
//     }
// }

export const createLogSign = async (req,res) => {
    const transaction = await db.transaction();
    try {
        const { logsigns } = req.body;

        if (!Array.isArray(logsigns) || logsigns.length === 0) {
            return res.status(400).json({message: "logsign must be a non-empty array."});
        }

        let newId = "LS00001";

        const lastRecord = await LogSign.findOne({
            order: [['id_logsign', 'DESC']],
            transaction,
        });

        let lastIdNumber = lastRecord ? parseInt(lastRecord.id_logsign.substring(2), 10) : 0;

        const formattedLogSigns = logsigns.map((sign, index) => {
            const newIdNumber  = (lastIdNumber + index + 1).toString().padStart(5, '0');
            return {
                id_logsign: `LS${newIdNumber}`,
                action: sign.action || "Created", 
                status: sign.status || "Pending",
                id_dokumen: sign.id_dokumen,
                id_karyawan: sign.id_karyawan,
                id_signers: sign.id_signers,
            };
        })

        await LogSign.bulkCreate(formattedLogSigns, {transaction});

        await transaction.commit();
        res.status(201).json({
            msg: "New logsigns have been created!",
            data: {logsigns: formattedLogSigns},
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error when creating logsigns: ", error);
        res.status(500).json({message: error.message});
    }
};

export const createItem = async(req, res) => {
    const transaction = await db.transaction();

    try {
        const {
            id_item,
            jenis_item,
            x_axis,
            y_axis,
            width,
            height
        } = req.body;

        const newItem = await Item.create({
            jenis_item,
            x_axis,
            y_axis,
            width,
            height
        },
        {transaction});

        const lastLogsign = await LogSign.findOne({
            attributes: ["id_logsign", "id_item"],
            order: [["id_logsign", "DESC"]],
        });

        const itemLogSign = await LogSign.update(
            { id_item: newItem.id_item}, 
            { where: {id_logsign: lastLogsign.id_logsign} ,transaction}
        );

        // await LogSign.update(
        //     {id_item: newItem.id_item}
        // )

        await transaction.commit();
        res.status(201).json({
            msg: "New item has been created!",
            data: {newItem, itemLogSign},
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error when creating item: ", error);
        res.status(500).json({message: error.message});
    }
}

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

                // document.filepath_dokumen = null;
                // await document.save();

                // return res.status(200).json({msg: "Document was deleted successfully."});
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
