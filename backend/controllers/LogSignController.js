import LogSign from "../models/LogSignModel.js";
import db from "../config/database.js";
import Karyawan from "../models/KaryawanModel.js";
import Signers from "../models/SignersModel.js";
import Sign from "../models/SignModel.js";

export const getLogSign = async(req, res) => {
    try {
        const {id_dokumen, id_signers} = req.query;

        // console.log("Received id dok:", id_dokumen);
        // console.log("Id signers nya adl:", id_signers);
        const response = await LogSign.findAll({
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

export const updateLogsign = async (req, res) => {
  const { id_dokumen, id_item, id_signers: oldIdSigner } = req.params;
  const { id_signers: newIdSigner } = req.body;

  try {
    // console.log("Incoming PATCH:", { id_dokumen, id_item, newIdSigner, oldIdSigner });

    const logsign = await LogSign.findOne({
      where: { id_dokumen, id_item, id_signers: oldIdSigner }
    });

    if (!logsign) {
      return res.status(404).json({ message: "Logsign not found" });
    }
    await LogSign.update(
      { id_signers: newIdSigner },
      {where: {id_dokumen, id_item, id_signers: oldIdSigner}});
    res.status(200).json({ msg: "Logsign updated successfully." });

  } catch (error) {
    console.error("Failed to update logsign:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// export const updateReminder = async(req,res) => {
//     const {id_dokumen} = req.params;
//     const {is_deadline, is_download, day_after_reminder, repeat_freq, deadline, subject, message} = req.body;

//     try {
//         const result = await LogSign.update(
//       {
//         is_deadline,
//         is_download,
//         day_after_reminder,
//         repeat_freq,
//         deadline
//       },
//       {
//         where: { id_dokumen },
//       }
//     );

//     // const subject = subject;
//     console.log("Subject:", subject);

//     // const message = message;
//     console.log("Message:", message);


//     if (result[0] === 0) {
//       return res.status(404).json({ message: "No log_sign records found to update." });
//     }
//     res.status(200).json({msg: "Reminder updated successfully."})
//     } catch (error) {
//         console.error("Failed to update reminder:", error.message);
//         res.status(500).json({message: error.message});
//     }
// };

export const getLastLogsignId = async (req, res) => {
    try {
        const lastRecord = await LogSign.findOne({
            order: [['id_logsign', 'DESC']],
        });

        if (lastRecord) {
            return res.status(200).json({ lastId: lastRecord.id_logsign });
        }
        return res.status(200).json({ lastId: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving last Item ID.' });
    }
}; 