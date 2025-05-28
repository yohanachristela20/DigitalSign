import { Sequelize } from "sequelize";
import db from "../config/database.js";

const {DataTypes} = Sequelize;

const Item = db.define('item_field', {
    id_item: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    jenis_item: DataTypes.STRING,
    x_axis: DataTypes.DECIMAL(15,4),
    y_axis: DataTypes.DECIMAL(15,4),
    width: DataTypes.DECIMAL(15,4),
    height: DataTypes.DECIMAL(15,4),
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (item_field, options) => {
            const lastRecord = await Item.findOne({
                order: [['id_item', 'DESC']]
            }); 
            let newId = "F00001"; //default id

            if (lastRecord && lastRecord.id_item) {
                const lastIdNumber = parseInt(lastRecord.id_item.substring(1), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(2, '0');
                newId = `F${incrementedIdNumber}`;
            }
            item_field.id_item = newId;
        },
    },  
}); 

export default Item; 

(async()=> {
    await db.sync();
})(); 