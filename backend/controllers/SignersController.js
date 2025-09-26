import Signers from "../models/SignersModel.js";
import Karyawan from "../models/KaryawanModel.js";
import { Op } from "sequelize";


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
    const {id_karyawan, sign_permission} = req.body;
    console.log("sign permission:", sign_permission);

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

        const signerData = id_karyawan.map((id, index) => ({
            id_signers: newId,
            id_karyawan: id, 
            sign_permission: Array.isArray(sign_permission) ? sign_permission[index] : sign_permission,
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
            attributes: ['id_signers', 'sign_permission'], 
            raw: true,
        });

        if (!latestSigner) {
            return res.status(404).json({message: "No signers found."});
        }

        const latestIdSigners = latestSigner.id_signers;
        const latestSignersPermission = latestSigner.sign_permission;
        console.log("latestSignersPermission:", latestSignersPermission);

        const excludedPermission = ['Receive a copy'];

        const response = await Signers.findAll({
            where: {
                id_signers: latestIdSigners,
                sign_permission: {
                    [Op.notIn]: excludedPermission,
                }
            },
            attributes: ['id_parent_signers', 'id_signers', 'id_karyawan', 'sign_permission'],
            include: [
                {
                    model: Karyawan, 
                    as: 'Penandatangan',
                    attributes: ['nama'],
                },
            ],
            order: [['id_parent_signers', 'ASC']],
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


export const updateSigner = async(req, res) => {
    const { id_karyawan: oldIdSigner } = req.params;
    const { sign_permission: signPermission } = req.body;

    try {
        const latestSigner = await Signers.findOne({
            where: { id_karyawan: oldIdSigner },
            order: [['id_parent_signers', 'DESC']]
        });

        if (latestSigner){
            await Signers.update(
                { sign_permission: signPermission },
                { where: {id_karyawan: oldIdSigner, id_parent_signers: latestSigner.id_parent_signers}}
            );
        }

    } catch (error) {
        console.error("Failed to update signer:", error.message);
        res.status(500).json({ message: error.message });
    }
};