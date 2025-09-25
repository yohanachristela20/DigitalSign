import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Dokumen from "./DokumenModel.js";
import Karyawan from "./KaryawanModel.js";
import Item from "./ItemModel.js";
import Signers from "./SignersModel.js";

const {DataTypes} = Sequelize;

const LogSign = db.define('log_sign', {
    id_logsign: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    tgl_tt: DataTypes.DATE,
    action:DataTypes.STRING,
    status: DataTypes.STRING,
    is_deadline: DataTypes.BOOLEAN, 
    deadline: DataTypes.DATEONLY, 
    day_after_reminder: DataTypes.INTEGER, 
    reminder_date: DataTypes.DATEONLY,
    reminder_sent: DataTypes.BOOLEAN,
    repeat_freq: DataTypes.STRING, 
    is_download: DataTypes.BOOLEAN,
    is_submitted: DataTypes.BOOLEAN,
    is_delegated: DataTypes.BOOLEAN,
    sign_permission: DataTypes.STRING,
    sign_base64: DataTypes.TEXT('long'),
    urutan: DataTypes.INTEGER,
    main_token: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    delegate_token: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    id_dokumen: {
        type: DataTypes.STRING,
        allowNull:false,
        references: {
            model: Dokumen,
            key: 'id_dokumen'
        }
    }, 
    id_karyawan: {
        type: DataTypes.STRING,
        allowNull:false,
        references: {
            model: Karyawan,
            key: 'id_karyawan'
        }
    }, 
    id_signers: {
        type: DataTypes.STRING,
        allowNull:true,
        references: {
            model: Karyawan,
            key: 'id_karyawan'
        }
    }, 
    delegated_signers: {
        type: DataTypes.STRING,
        allowNull:true,
        references: {
            model: Karyawan,
            key: 'id_karyawan'
        }
    }, 
    id_item: {
        type: DataTypes.STRING,
        allowNull:true,
        references: {
            model: Item,
            key: 'id_item'
        }
    }, 

}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (log_sign, options) => {
            const lastRecord = await LogSign.findOne({
                order: [['id_logsign', 'DESC']]
            }); 
            let newId = "LS00001"; //default id

            if (lastRecord && lastRecord.id_logsign) {
                const lastIdNumber = parseInt(lastRecord.id_logsign.substring(2), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `LS${incrementedIdNumber}`;
            }
            log_sign.id_logsign = newId;
        },
    },  
}); 

export default LogSign; 

(async()=> {
    await db.sync();
})(); 