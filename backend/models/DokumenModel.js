import { Sequelize } from "sequelize";
import db from "../config/database.js";
import KategoriDokumen from "./KategoriDokModel.js";

const {DataTypes} = Sequelize;

const Dokumen = db.define('dokumen', {
    id_dokumen: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    nama_dokumen: DataTypes.STRING,
    filepath_dokumen: DataTypes.STRING,
    is_deleted: DataTypes.BOOLEAN,
    id_kategoridok: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: KategoriDokumen,
            key: 'id_kategoridok'
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (dokumen, options) => {
            const lastRecord = await Dokumen.findOne({
                order: [['id_dokumen', 'DESC']]
            }); 
            let newId = "D00001"; //default id

            if (lastRecord && lastRecord.id_dokumen) {
                const lastIdNumber = parseInt(lastRecord.id_dokumen.substring(1), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `D${incrementedIdNumber}`;
            }
            dokumen.id_dokumen = newId;
        },
    },  
}); 

export default Dokumen; 

(async()=> {
    await db.sync();
})(); 