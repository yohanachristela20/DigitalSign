import LogSign from "../models/LogSignModel.js";
import db from "../config/database.js";
import Karyawan from "../models/KaryawanModel.js";
import Signers from "../models/SignersModel.js";

// export const getLogSign = async(req, res) => {
//     try {
//         const response = await LogSign.findAll();
//         res.status(200).json(response); 
//     } catch (error) {
//         console.log(error.message); 
//     }
// }

export const getLogSign = async(req, res) => {
    try {
        const {id_dokumen, id_signers} = req.query;

        console.log("Received id dok:", id_dokumen);
        console.log("Id signers nya adl:", id_signers);
        const response = await LogSign.findAll({
            // where: {
            //     id_dokumen: id_dokumen
            // },
            include: [
                {
                    model: Signers,
                    as: "Signer", 
                    attributes: ["id_signers"],
                }
            ],
            attributes: [ 
                'id_signers'
            ], 
            raw: false,
        });
        console.log("Signers: ", response);
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({message: "Error fetching signers"});
    }
};

// export const updateLogSign = async(req, res) => {
//     try {
//         await LogSign.update(req.body, {
//             where: {
//                 id_logsign: req.params.id_logsign
//             }
//         });
//         res.status(200).json({msg: "Signer was updated successfully."});
//     } catch (error) {
//         res.status(500).json({message: error.message});
//     }
// }