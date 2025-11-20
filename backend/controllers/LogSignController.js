import LogSign from "../models/LogSignModel.js";
import db from "../config/database.js";
import Karyawan from "../models/KaryawanModel.js";
import Signers from "../models/SignersModel.js";
import Item from "../models/ItemModel.js";

export const getLogSign = async(req, res) => {
    try {
        const {id_dokumen, id_signers} = req.query;
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
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({message: "Error fetching signers"});
    }
};

export const updateLogsign = async (req, res) => {
  const { id_dokumen, id_item, id_signers: oldIdSigner } = req.params;
  const { id_signers: newIdSigner, sign_permission: signPermission } = req.body;

  try {
    const logsign = await LogSign.findOne({
      where: { id_dokumen, id_item, id_signers: oldIdSigner }
    });

    if (!logsign) {
      return res.status(404).json({ message: "Logsign not found" });
    }

    await LogSign.update(
      { id_signers: newIdSigner, sign_permission: signPermission, id_item: null },
      {where: {id_dokumen, id_item, id_signers: oldIdSigner}});

    await Item.destroy({
      where: { id_item }
    });

    const latestSigner = await Signers.findOne({
      where: { id_karyawan: oldIdSigner },
      order: [['id_parent_signers', 'DESC']]  
    });

    if (latestSigner) {
      await latestSigner.destroy();
    }



    res.status(200).json({ msg: "Logsign updated successfully." });

  } catch (error) {
    console.error("Failed to update logsign:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// export const updatePermission = async (req, res) => {
//   const { id_dokumen, id_signers } = req.params;
//   const { sign_permission, id_item } = req.body;

//   try {
//     const logsign = await LogSign.findOne({
//       where: { id_dokumen, id_signers }
//     });

//     if (!logsign) {
//       return res.status(404).json({ message: "Logsign not found" });
//     }

//     await LogSign.update(
//       {sign_permission, id_item },
//       {where: {id_dokumen, id_signers}});
//     res.status(200).json({ msg: "Logsign updated successfully.", id_item });

//   } catch (error) {
//     console.error("Failed to update logsign:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

export const updatePermission = async (req, res) => {
  const { id_dokumen, id_signers } = req.params;
  const { sign_permission, id_item, x_axis, y_axis, width, height, page, jenis_item } = req.body;

  try {
    const logsign = await LogSign.findOne({
      where: { id_dokumen, id_signers }
    });

    if (!logsign) {
      return res.status(404).json({ message: "Logsign not found" });
    }

    await LogSign.update(
    {sign_permission, id_item },
    {where: {id_dokumen, id_signers}});

    if (id_item) {
      await Item.update(
        {x_axis, y_axis, width, height, page, jenis_item},
        {where: {id_item}}
      )
    }

    res.status(200).json({ msg: "Logsign updated successfully.", id_item });

  } catch (error) {
    console.error("Failed to update logsign:", error.message);
    res.status(500).json({ message: error.message });
  }
};

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


export const updateItem = async (req, res) => {
  const { id_dokumen, id_signers } = req.params;
  const { sign_permission, jenis_item } = req.body;
  const transaction = await db.transaction();

  try {
    const items = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "No item data provided." });
    }

    const logsignData = await LogSign.findOne({
      where: { id_dokumen, id_signers }, 
      transaction,
    });

    if (!logsignData) {
      await transaction.rollback();
      return res.status(404).json({ message: "LogSign not found for given params." });
    }

    const lastRecord = await Item.findOne({
      order: [['id_item', 'DESC']],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    let lastIdNumber = lastRecord ? parseInt(lastRecord.id_item.substring(2), 10) : 0;

    const formattedItems = items.map((item, index) => {
        const newIdNumber  = (lastIdNumber + index + 1).toString().padStart(5, '0');
        return {
            id_item: `F${newIdNumber}`,
            jenis_item: item.jenis_item,
            x_axis: item.x_axis,
            y_axis: item.y_axis, 
            width: item.width,
            height: item.height,
            page: item.page,
            id_karyawan: item.id_karyawan ?? null,
            delegated_signers: item.delegated_signers ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    })

    const created = await Item.bulkCreate(formattedItems, {transaction, returning: true});
    if (created && created.length > 0) {
      const firstItemId = created[0].id_item;
      await LogSign.update(
        { id_item: firstItemId },
        {
          where: { id_dokumen, id_signers },
          transaction,
        }
      );
    }

    await transaction.commit();
    return res.status(201).json({
      msg: "New item has been created!",
      data: {items: created},
      logsign: { id_dokumen, id_signers },
    });

    // res.status(200).json(logsignData);
  } catch (error) {
    await transaction.rollback();
    console.error("updateItem error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}