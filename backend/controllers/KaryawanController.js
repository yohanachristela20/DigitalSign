import { response } from "express";
import Karyawan from "../models/KaryawanModel.js";
import User from "../models/UserModel.js";
import Signers from "../models/SignersModel.js";
import { Op } from "sequelize";

export const getKaryawan = async(req, res) => {
    try {
        const response = await Karyawan.findAll({
            attributes: ['id_karyawan', 'nama', 'job_title', 'organisasi'],
            include: [
                {
                    model: User,
                    as: 'Pengguna', 
                    attributes: ['email']
                }, 
                {
                    model: Signers, 
                    as: 'Penandatangan', 
                    attributes: ['sign_permission']
                }
            ],
            order: [['id_karyawan', 'ASC']]
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({ message: "Failed to fetch employees name" });
    }
}

export const karyawanDetails = async(req, res) => {
    try {
        const response = await Karyawan.findAll({
            attributes: ['id_karyawan', 'nama', 'job_title', 'organisasi'],
            include: [{
                model: User,
                as: 'Penerima', 
                attributes: ['email']
            }],
            order: [['id_karyawan', 'ASC']]
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({ message: "Failed to fetch employees name" });
    }
}

export const getKaryawanById = async(req, res) => {
    try {
        const response = await Karyawan.findOne({
            where:{
                id_karyawan: req.params.id_karyawan 
            },
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createKaryawan = async(req, res) => {
    try {
        await Karyawan.create(req.body);
        res.status(201).json({msg: "New Employee data has been created!"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const updateKaryawan = async(req, res) => {
    try {
        await Karyawan.update(req.body, {
            where:{
                id_karyawan: req.params.id_karyawan
            }
        });
        res.status(200).json({msg: "Employee data was updated successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}


export const deleteKaryawan = async(req, res) => {
    try {
        await Karyawan.destroy({
            where:{
                id_karyawan: req.params.id_karyawan
            }
        });
        res.status(200).json({msg: "Employee data was deleted successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}


export const getLastKaryawanId = async (req, res) => {
    try {
        const latestIdKaryawan = await Karyawan.findOne({
            order: [['id_karyawan', 'DESC']]
        });

        let nextId = 'K00001';
        if (latestIdKaryawan && latestIdKaryawan.id_karyawan) {
            const lastNumeric = parseInt(latestIdKaryawan.id_karyawan.substring(1), 10);
            const incremented = (lastNumeric + 1).toString().padStart(5, '0');
            nextId = `K${incremented}`;
        }
        // console.log("getLastIdKaryawan: ", nextId);
        return res.status(200).json({nextId});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id detail barang'});
    }
};

export const getKaryawanDetails = async (req, res) => {  
    try {
        const response = await Karyawan.findAll({
        include: [
            {
                model: User,
                as: 'Pengguna',
                attributes: ['email', 'role', 'user_active'],
            },
            {
                model: Signers, 
                as: 'Penandatangan', 
                attributes: ['sign_permission']
            }
        ],
        });

        console.log("Karyawan details:", response);
        res.status(200).json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user details" });
    }
};


export const getKaryawanPermission = async (req, res) => {  
   try {
        const response = await Karyawan.findOne({
            where: {
                id_karyawan: req.params.id_karyawan
            }, 
            include:[
                {
                    model: Signers,
                    as: 'Permission',
                    attributes: ['id_signers', 'id_karyawan', 'sign_permission'],
                }
            ]
        });

        if (!response) {
            return res.status(404).json({ message: "Signer not found" });
        }

        console.log("Signer details: ", response);
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error fetching signer details"});
    }
};


