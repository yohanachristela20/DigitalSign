import { Sequelize } from "sequelize";
import db from "../config/database.js";
import LogSign from "./LogSignModel.js";

const {DataTypes} = Sequelize;

const Sign = db.define('sign', {
    id_sign: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    id_logsign: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: LogSign, 
            key: 'id_logsign' 
        }
    },
    // id_signers: {
    //     type: DataTypes.STRING, 
    //     allowNull: false,
    //     references: {
    //         model: Signers,
    //         key: 'id_signers'
    //     }
    // }
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (sign, options) => {
            const lastRecord = await Sign.findOne({
                order: [['id_sign', 'DESC']]
            }); 
            let newId = "SN00001"; //default id

            if (lastRecord && lastRecord.id_sign) {
                const lastIdNumber = parseInt(lastRecord.id_sign.substring(2), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(3, '0');
                newId = `SN${incrementedIdNumber}`;
            }
            sign.id_sign = newId;
        },
    },  
}); 

export default Sign; 

(async()=> {
    await db.sync();
})(); 