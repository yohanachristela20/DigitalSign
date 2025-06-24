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
        const lastRecord = await LogSign.findOne({
            order: [['id_dokumen', 'DESC']],
        });

        if (id_signers) {
            await LogSign.destroy({
                where: {id_dokumen: lastRecord.id_dokumen, id_signers},
            });
            res.status(200).json({message: "Logsign deleted successfully."});
        }

    } catch (error) {
        console.error("Failed to delete logsign by id_signers", error)
        res.status(500).json({message: error.message});
    }
}


// LAST USED
export const updateLogsign = async(req, res) => {
    const {id_signers} = req.params;
    try {
        const lastRecord = await LogSign.findOne({
            order: [['id_dokumen', 'DESC']],
        });

        if (id_signers) {
            await LogSign.update(req.body, {
                where: 
                {id_dokumen: lastRecord.id_dokumen, id_signers}
            });
            res.status(200).json({msg: "Logsign was updated successfully."});
        }
    } catch (error) {
        console.error("Failed to update logsign", error)
        res.status(500).json({message: error.message});
    }
}


// export const updateLogsign = async(req, res) => {
//     const {id_logsign} = req.params;

//     try {
//         const logsign = await LogSign.findOne({where: {id_logsign}});

//         if (!logsign) {
//             return res.status(404).json({message: "Logsign not found."});
//         }

//         await LogSign.update(req.body, {
//             where: {id_logsign}
//         });

//         res.status(200).json({msg: "Logsign was updated successfully."});
//     } catch (error) {
//         console.error("Failed to update logsign:", error);
//         res.status(500).json({message: error.message});
//     }
// };

// LAST BENAR
// export const updateLogsign = async(req, res) => {
//     try {
//         await LogSign.update(req.body, {
//             where:{
//                 id_signers: req.params.id_signers
//             }
//         });
//         res.status(200).json({msg: "Logsign was updated successfully."}); 
//     } catch (error) {
//         console.log("Failed to update logsign:", error.message);
//         res.status(500).json({message: error.message}); 
//     }
// }


// LATESTT
// export const updateLogsign = async(req, res) => {
//     try {
//         const {id_signers} = req.params;
//         const {id_signers: new_id_signers} = req.body;
//         console.log("Id signers-new id signers: ", new_id_signers);

//         const logsign = await LogSign.findOne({where: {id_signers}});

//         if (!logsign) {
//             return res.status(404).json({message: "Logsign not found."});
//         }   

//         await LogSign.update(
//             { id_signers: new_id_signers}, 
//             {where: {id_signers}}
//         );
//         res.status(200).json({msg: "Logsign was updated successfully."}); 
//     } catch (error) {
//         console.log("Failed to update logsign:", error.message);
//         res.status(500).json({message: error.message}); 
//     }
// }

// export const updateLogsign = async(req, res) => {
//     try {
//         await LogSign.update(
//             {id_signers: req.body.id_signers}, 
//             {where: {id_signers: req.params.id_signers}}
//         );
//         res.status(200).json({msg: "Logsign was updated successfully."});
//     } catch (error) {
//         console.error("Failed to update logsign:", error.message);
//         res.status(500).json({error: error.message});
//     }
// };



// export const updateLogsign = async(req, res) => {
//     // const transaction = await db.transaction();
//     try {
//         const response = await LogSign.update(req.body, {
//             where:{
//                 id_signers: req.params.id_signers
//             }
//         });

//         // await transaction.commit();
//         console.log("Updated logsign: ", response);
//         res.status(200).json({msg: "Logsign was updated successfully."}); 
//     } catch (error) {
//         // await transaction.rollback();
//         console.log("Failed to update logsign:", error.message);
//         res.status(500).json({message: error.message}); 
//     }
// }