import LogSign from "../models/LogSignModel.js";
import db from "../config/database.js";

export const getLogSign = async(req, res) => {
    try {
        const response = await LogSign.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

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