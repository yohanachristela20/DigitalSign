import { response } from "express";
import Signers from "../models/SignersModel.js";

export const getSigners = async(req, res) => {
    try {
        const response = await Signers.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getSignersById = async(req, res) => {
    try {
        const response = await Signers.findOne({
            where:{
                id_signers: req.params.id_signers 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createSigner = async(req, res) => {
    try {
        await Signers.create(req.body);
        res.status(201).json({msg: "New Signers has been created!"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const updateSigners = async(req, res) => {
    try {
        await Signers.update(req.body, {
            where:{
                id_signers: req.params.id_signers
            }
        });
        res.status(200).json({msg: "Signers was updated successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}


export const deleteSigner = async(req, res) => {
    try {
        await Signers.destroy({
            where:{
                id_signers: req.params.id_signers
            }
        });
        res.status(200).json({msg: "Signers data was deleted successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}


export const getLastSignerId = async (req, res) => {
    try {
        const latestIdSigner = await Signers.findOne({
            order: [['id_signers', 'DESC']]
        });

        let nextId = 'S00001';
        if (latestIdSigner && latestIdSigner.id_signers) {
            const lastNumeric = parseInt(latestIdSigner.id_signers.substring(1), 10);
            const incremented = (lastNumeric + 1).toString().padStart(5, '0');
            nextId = `S${incremented}`;
        }
        // console.log("getLastIdKaryawan: ", nextId);
        return res.status(200).json({nextId});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id signers'});
    }
};

// export const getKaryawanDetails = async (req, res) => {  
//     try {
//         const response = await Karyawan.findAll({
//         include: [
//             {
//                 model: User,
//                 as: 'Pengguna',
//                 attributes: ['email', 'role', 'user_active'],
//             },
//         ],
//         });

//         console.log("Karyawan details:", response);
//         res.status(200).json(response);

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching user details" });
//     }
// };


