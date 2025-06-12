import Karyawan from "./KaryawanModel.js";
import User from "./UserModel.js";
import Dokumen from "./DokumenModel.js";
import KategoriDokumen from "./KategoriDokModel.js";
import Item from "./ItemModel.js";
import LogSign from "./LogSignModel.js";
import Sign from "./SignModel.js";

User.belongsTo(Karyawan, { foreignKey: 'id_karyawan', as: 'Pengguna' });
LogSign.belongsTo(Karyawan, {foreignKey: 'id_signers', as:'Signer'});
Dokumen.belongsTo(KategoriDokumen, {foreignKey: 'id_kategoridok', as: 'Kategori'});
LogSign.belongsTo(Dokumen, {foreignKey: 'id_dokumen', as: 'Dokumen'});
LogSign.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as: 'Pemohon'});
Sign.belongsTo(LogSign, {foreignKey: 'id_logsign', as:'TTDokumen'});
LogSign.belongsTo(Item, {foreignKey: 'id_item', as: 'ItemField'});

Karyawan.hasMany(User, { foreignKey: 'id_karyawan', as:'Pengguna'});
Karyawan.hasMany(LogSign, {foreignKey: 'id_karyawan', as: 'Signer'});

KategoriDokumen.hasMany(Dokumen, {foreignKey: 'id_kategoridok', as:'Kategori'});
Dokumen.hasMany(LogSign, {foreignKey: 'id_dokumen', as: 'Dokumen'});
Karyawan.hasMany(LogSign, {foreignKey: 'id_signers', as: 'Pemohon'});
LogSign.hasOne(Sign, {foreignKey: 'id_logsign', as: 'TTDokumen'});
Item.hasOne(LogSign, {foreignKey: 'id_item', as:'ItemField'});