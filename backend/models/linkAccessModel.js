import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Karyawan from "./KaryawanModel.js";
import LogSign from "./LogSignModel.js";


const {DataTypes} = Sequelize;

const LinkAccessLog = db.define('link_access_log', {
    id_access_log: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    intended_email: DataTypes.STRING,
    real_email: DataTypes.STRING,
    accessed_at: DataTypes.DATE,
    is_accessed: {
        type: DataTypes.BOOLEAN,
    },
    ip_client: DataTypes.STRING, 
    id_logsign: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: LogSign,
            key: 'id_logsign'
        }
    },
    id_karyawan: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Karyawan,
            key: 'id_karyawan'
        }
    },
});

export default LinkAccessLog;

(async()=> {
    await db.sync();
})(); 