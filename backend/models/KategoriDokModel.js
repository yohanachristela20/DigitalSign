import { Sequelize } from "sequelize";
import db from "../config/database.js";

const {DataTypes} = Sequelize;

const KategoriDokumen = db.define('kategori_dokumen', {
    id_kategoridok: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    kategori: DataTypes.STRING,
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (kategori_dokumen, options) => {
            const lastRecord = await KategoriDokumen.findOne({
                order: [['id_kategoridok', 'DESC']]
            }); 
            let newId = "KD00001"; //default id

            if (lastRecord && lastRecord.id_kategoridok) {
                const lastIdNumber = parseInt(lastRecord.id_kategoridok.substring(2), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `KD${incrementedIdNumber}`;
            }
            kategori_dokumen.id_kategoridok = newId;
        },
    },  
}); 

export default KategoriDokumen; 

(async()=> {
    await db.sync();
})(); 