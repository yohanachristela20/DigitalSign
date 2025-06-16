import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Karyawan from "./KaryawanModel.js";

const {DataTypes} = Sequelize;

const Signers = db.define('signers', {
    id_parent_signers: {
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true,
    },
    id_signers: {
        type: DataTypes.STRING, 
        // primaryKey: true,
    },
    id_karyawan: {
        type: DataTypes.STRING,
        allowNull:false,
        references: {
            model: Karyawan,
            key: 'id_karyawan'
        }
    }, 
}, {
    freezeTableName: true,
    timestamps: true,
    // hooks: {
    //     beforeCreate: async (signers, options) => {
    //         const lastRecord = await Signers.findOne({
    //             order: [['id_signers', 'DESC']]
    //         }); 
    //         let newId = "SG00001"; //default id

    //         if (lastRecord && lastRecord.id_signers) {
    //             const lastIdNumber = parseInt(lastRecord.id_signers.substring(2), 10); 
    //             const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
    //             newId = `SG${incrementedIdNumber}`;
    //         }
    //         signers.id_signers = newId;
    //     },
    // },  
}); 

export default Signers; 

(async()=> {
    await db.sync();
})(); 