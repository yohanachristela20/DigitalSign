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


// LAST USED yyy
// export const updateLogsign = async(req, res) => {
//     const {id_signers} = req.params;
//     try {
//         const lastRecord = await LogSign.findOne({
//             order: [['id_dokumen', 'DESC']],
//         });

//         if (id_signers) {
//             await LogSign.update(req.body, {
//                 where: 
//                 {id_dokumen: lastRecord.id_dokumen, id_signers: lastRecord.id_signers}
//             });
//             res.status(200).json({msg: "Logsign was updated successfully."});
//         }
//     } catch (error) {
//         console.error("Failed to update logsign", error)
//         res.status(500).json({message: error.message});
//     }
// }


// BARU POLL
// export const updateLogsign = async (req, res) => {
//   const { id_signers } = req.params;

//   try {
//     if (!id_signers) {
//       return res.status(400).json({ message: "id_signers is required" });
//     }

//     let logsign = await LogSign.findOne({
//       where: { id_signers },
//       order: [['id_dokumen', 'DESC']],
//     });

//     if (!logsign) {
//       return res.status(404).json({ message: "Logsign not found" });
//     }

//       await LogSign.update(req.body, {
//       where: {id_dokumen: logsign.id_dokumen, id_signers}
//     });

//     res.status(200).json({ msg: "Logsign was updated successfully." });
//   } catch (error) {
//     console.error("Failed to update logsign:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

// BWARRUUUU
// export const updateLogsign = async (req, res) => {
//   const { id_dokumen, id_signers } = req.params;

//   try {
//     if (!id_dokumen || !id_signers) {
//       return res.status(400).json({ message: "id_dokumen and id_signers are required" });
//     }

//     const logsign = await LogSign.findOne({
//       where: { id_dokumen, id_signers }
//     });

//     if (!logsign) {
//       return res.status(404).json({ message: "Logsign not found" });
//     }

//     await LogSign.update(req.body, {
//       where: { id_dokumen, id_signers }
//     });

//     res.status(200).json({ msg: "Logsign updated successfully." });
//   } catch (error) {
//     console.error("Failed to update logsign:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateLogsign = async (req, res) => {
//   const { id_dokumen, id_signers: oldIdSigner } = req.params;
//   const { id_signers: newIdSigner } = req.body;

//   try {
//     if (!id_dokumen || !oldIdSigner || !newIdSigner) {
//       return res.status(400).json({ message: "Required parameters missing" });
//     }

//     // Pastikan data yang akan diupdate ada
//     const logsign = await LogSign.findOne({
//       where: { id_dokumen, id_signers: oldIdSigner }
//     });

//     if (!logsign) {
//       return res.status(404).json({ message: "Logsign not found" });
//     }

//     // Update id_signers dari oldIdSigner ke newIdSigner
//     await LogSign.update(
//       { id_signers: newIdSigner },
//       { where: { id_dokumen, id_signers: oldIdSigner } }
//     );

//     res.status(200).json({ msg: "Logsign updated successfully." });
//   } catch (error) {
//     console.error("Failed to update logsign:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };


//LASSSST
// export const updateLogsign = async (req, res) => {
//   const { id_dokumen, id_item } = req.params;
//   const { id_signers: newIdSigner } = req.body;

//   try {
//     if (!id_dokumen || !id_item || !newIdSigner) {
//       return res.status(400).json({ message: "Required parameters missing" });
//     }

//     const logsign = await LogSign.findOne({
//       where: { id_dokumen, id_item }
//     });

//     if (!logsign) {
//       return res.status(404).json({ message: "Logsign not found" });
//     }
//     await LogSign.update(
//       { id_signers: newIdSigner },
//       { where: { id_dokumen, id_item } }
//     );

//     res.status(200).json({ msg: "Logsign updated successfully." });
//   } catch (error) {
//     console.error("Failed to update logsign:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateLogsign = async (req, res) => {
  const { id_dokumen, id_item, id_signers: oldIdSigner } = req.params;
  const { id_signers: newIdSigner } = req.body;

  try {
    console.log("Incoming PATCH:", { id_dokumen, id_item, newIdSigner, oldIdSigner });

    // if (!id_dokumen || !id_item || !newIdSigner || !id_signers) {
    //   return res.status(400).json({ message: "Required parameters missing" });
    // }

    const logsign = await LogSign.findOne({
      where: { id_dokumen, id_item, id_signers: oldIdSigner }
    });

    // console.log("Logsign found?", logsign);

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



// export const updateLogsign = async (req, res) => {
//   const { logsigns, id_signers } = req.body;

//   if (!Array.isArray(logsigns) || logsigns.length === 0) {
//     return res.status(400).json({ message: "logsigns must be a non-empty array." });
//   }

//   const transaction = await db.transaction();
//   try {
//     for (const log of logsigns) {
//       const { id_logsign, id_signers } = log;

//       if (!id_logsign || !id_signers) {
//         continue; 
//       }

//       await LogSign.update(
//         { id_signers },
//         {
//           where: { id_logsign },
//           transaction
//         }
//       );
//     }

//     await transaction.commit();
//     res.status(200).json({ msg: "Logsigns were updated successfully." });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Failed to update logsigns:", error.message);
//     res.status(500).json({ message: "Failed to update logsigns." });
//   }
// };



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