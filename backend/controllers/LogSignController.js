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

export const deleteLogsign = async(req, res) => {
    const {id_signers} = req.params;

    try {
        await LogSign.destroy({
            where: {id_signers},
        });

        res.status(200).json({message: "Logsign deleted successfully."});
    } catch (error) {
        console.error("Failed to delete logsign by id_signers", error)
        res.status(500).json({message: error.message});
    }
}