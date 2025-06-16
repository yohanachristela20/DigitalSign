import Signers from "../models/SignersModel.js";
import Karyawan from "../models/KaryawanModel.js";
import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";
import {Op} from "sequelize"

// export const getSigner = async(req, res) => {
//     try {
//         const response = await Signers.findAll();
//         res.status(200).json(response);
//     } catch (error) {
//         console.log(error.message);
//     }
// };

// export const getSigner = async(req, res) => {
//     try {
//         const {id_dokumen, id_signers} = req.query;

//         console.log("Received id dok:", id_dokumen);
//         console.log("Id signers nya adl:", id_signers);

//         const response = await Signers.findAll({
//             // where: {
//             //     id_dokumen: id_dokumen
//             // }, 
//             include: [
//                 {
//                     model: Karyawan,
//                     as:'Penandatangan', 
//                     attributes: ["nama"], 
//                 }
//             ], 
//             attributes: [
//                 'id_karyawan'
//             ],
//             raw: false,
//         });
//         console.log("Signers: ", response);
//         res.status(200).json(response);
//     } catch (error) {
//         console.log(error.message);
//     }
// };

export const getSignerById = async(req, res) => {
    try {
        const response = await Signers.findOne({
            where: {
                id_signers: req.params.id_signers
            }
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
};

// export const createSigner = async(req, res) => {
//     try {
//         console.log(req.body);
//         await Signers.create(req.body);
//         res.status(201).json({msg: "New signer has been created!"});
//     } catch (error) {
//         res.status(500).json({message: error.message});
//     }
// };

export const createSigner = async(req, res) => {
    const {id_karyawan} = req.body;

    if (!Array.isArray(id_karyawan) || id_karyawan.length === 0) {
        return res.status(400).json({message: "id_karyawan must be a non-empty array"});
    }

    try {
        const lastRecord = await Signers.findOne({
            order: [['id_signers', 'DESC']]
        });

        let newId = "SG00001";
        if (lastRecord && lastRecord.id_signers) {
            const lastIdNumber = parseInt(lastRecord.id_signers.substring(2), 10);
            const incrementedId = (lastIdNumber + 1).toString().padStart(5, '0');
            newId = `SG${incrementedId}`;
        }

        const signerData = id_karyawan.map(id => ({
            id_signers: newId,
            id_karyawan: id
        })); 

        await Signers.bulkCreate(signerData);

        res.status(201).json({msg: "New signers created successfully!", id_signers: newId});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: error.message});
    }
};

export const getSigner = async(req, res) => {
    try {
        const latestSigner = await Signers.findOne({
            order: [['id_signers', 'DESC']],
            attributes: ['id_signers'], 
            raw: true,
        });

        if (!latestSigner) {
            return res.status(404).json({message: "No signers found."});
        }

        const latestIdSigners = latestSigner.id_signers;

        const response = await Signers.findAll({
            where: {
                id_signers: latestIdSigners,
            },
            attributes: ['id_parent_signers', 'id_signers', 'id_karyawan'],
            include: [
                {
                    model: Karyawan, 
                    as: 'Penandatangan',
                    attributes: ['nama'],
                },
            ],
            order: [['id_parent_signers', 'DESC']],
        });

        console.log("Signer details: ", response);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error fetching signer details"});
    }
};


export const getSignerDetails = async(req, res) => {
    try {
        const response = await Signers.findAll({
            include: [
                {
                    model: Karyawan,
                    as: 'Penandatangan',
                    attributes: ['nama'],
                },
            ],
        });

        console.log("Signer details: ", response);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error fetching signer details"});
    }
};