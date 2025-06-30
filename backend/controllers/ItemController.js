import Item from "../models/ItemModel.js";


export const getLastItemId = async (req, res) => {
    try {
        const lastRecord = await Item.findOne({
            order: [['id_item', 'DESC']],
        });

        if (lastRecord) {
            return res.status(200).json({ lastId: lastRecord.id_item });
        }
        return res.status(200).json({ lastId: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving last Item ID.' });
    }
}; 