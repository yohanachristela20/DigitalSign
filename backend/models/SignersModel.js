import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Karyawan from "./KaryawanModel.js";
import ItemModel from "./ItemModel.js";
import LogSign from "./LogSignModel.js";

const {DataTypes} = Sequelize;

const Signers = db.define('signers', {
    id_signers: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    id_karyawan: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Karyawan, 
            key: 'id_karyawan' 
        }
    }, 
    // id_item: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     references: {
    //         model: ItemModel, 
    //         key: 'id_item' 
    //     }
    // }, 
    // id_logsign: {
    //     type: DataTypes.STRING, 
    //     allowNull: false,
    //     references: {
    //         model: LogSign,
    //         key: 'id_logsign',
    //     }
    // }
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (signers, options) => {
            const lastRecord = await Signers.findOne({
                order: [['id_signers', 'DESC']]
            }); 
            let newId = "S00001"; //default id

            if (lastRecord && lastRecord.id_signers) {
                const lastIdNumber = parseInt(lastRecord.id_signers.substring(1), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(2, '0');
                newId = `S${incrementedIdNumber}`;
            }
            signers.id_signers = newId;
        },
    },  
}); 

export default Signers; 

(async()=> {
    await db.sync();
})(); 