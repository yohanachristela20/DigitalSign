import Dokumen from "../models/DokumenModel.js";
import bcrypt from "bcrypt";
import { group } from "console";
import path from "path";
import KategoriDokumen from "../models/KategoriDokModel.js";

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
        const response = await Dokumen.findAll();
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
    try {
        const response = await Dokumen.findAll({
            attributes: ["id_dokumen", "nama_dokumen", "id_kategoridok", "createdAt"],
             include: [
                {
                    model: KategoriDokumen,
                    as: "Kategori",
                    attributes: ["id_kategoridok"],
                },
            ],
            group: ["Kategori.id_kategoridok"],
            raw: true,
        });
        console.log("Document by category: ", response);
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}



export const createDocument = async(req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({message: "PDF file is required"})
        }
        const {id_dokumen, nama_dokumen, id_kategoridok} = req.body;
        const filePath = path.join("uploads/files", req.file.filename);

        await Dokumen.create({
            id_dokumen,
            nama_dokumen,
            id_kategoridok,
            filepath_dokumen: filePath,
        });
        console.log(req.body);
        // await Dokumen.create(req.body);
        res.status(201).json({msg: "New Document has been created!", filePath}); 
    } catch (error) {
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
        await Dokumen.destroy(
        {
            where:{
                id_dokumen: req.params.id_dokumen
            }
        }
    );
        res.status(200).json({msg: "Document was deleted successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
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
